import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import { Request, Response } from 'express';
import { auth } from './auth.instance';
import { PrismaService } from '../prisma/prisma.service';

export class FacilitatorLoginDto {
  @ApiProperty({ example: 'animateur.kwilu@rikolto.org' })
  email!: string;

  @ApiProperty({ example: 'Avenir2026!' })
  password!: string;
}

export class FacilitatorRegisterDto {
  @ApiProperty({ example: 'Jean-Paul Mbemba' })
  name!: string;

  @ApiProperty({ example: 'animateur.kwilu@rikolto.org' })
  email!: string;

  @ApiProperty({ example: 'Avenir2026!' })
  password!: string;

  @ApiProperty({ example: 'Kwilu', required: false })
  province?: string;

  @ApiProperty({ example: 'FACILITATOR', required: false })
  role?: string;
}

export class AuthPortalUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  organization!: string;

  @ApiProperty()
  province!: string;
}

export class AuthPortalResponseDto {
  @ApiProperty()
  authenticated!: boolean;

  @ApiProperty({ required: false })
  token?: string;

  @ApiProperty({ type: () => AuthPortalUserDto, required: false })
  user?: AuthPortalUserDto;
}

@ApiTags('Auth (BetterAuth - Rikolto & Animateurs)')
@Controller('api/auth-portal')
export class AuthController {
  private betterAuthHandler = toNodeHandler(auth);

  constructor(private readonly prisma: PrismaService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Vérifier le statut de la plateforme (accès public sans compte actif + BetterAuth)',
  })
  @ApiResponse({ status: 200, type: AuthPortalResponseDto })
  async getStatus(@Req() req: Request): Promise<AuthPortalResponseDto> {
    try {
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });
      if (session?.user) {
        return {
          authenticated: true,
          token: session.session?.token,
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: (session.user as any).role || 'FACILITATOR',
            organization: (session.user as any).organization || 'Rikolto RDC - Projet AVENIR',
            province: (session.user as any).province || 'Kwilu',
          },
        };
      }
    } catch {
      // Anonymous guest mode is the default
    }
    return {
      authenticated: false,
    };
  }

  @Post('register')
  @ApiOperation({
    summary: 'Créer un compte Animateur de terrain ou Administrateur Rikolto via BetterAuth',
  })
  @ApiResponse({ status: 201, type: AuthPortalResponseDto })
  async register(@Body() dto: FacilitatorRegisterDto): Promise<AuthPortalResponseDto> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      return {
        authenticated: true,
        user: {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          role: existing.role,
          organization: existing.organization || 'Rikolto RDC - Projet AVENIR',
          province: existing.province || 'Kwilu',
        },
      };
    }

    const res = await auth.api.signUpEmail({
      body: {
        name: dto.name,
        email: dto.email,
        password: dto.password,
        role: dto.role || 'FACILITATOR',
        province: dto.province || 'Kwilu',
        organization: 'Rikolto RDC - Projet AVENIR',
      } as any,
    });

    return {
      authenticated: true,
      token: res.token || undefined,
      user: {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: (res.user as any).role || dto.role || 'FACILITATOR',
        organization: (res.user as any).organization || 'Rikolto RDC - Projet AVENIR',
        province: (res.user as any).province || dto.province || 'Kwilu',
      },
    };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Connexion Animateur / Équipe Rikolto via BetterAuth',
  })
  @ApiResponse({ status: 200, type: AuthPortalResponseDto })
  async login(@Body() dto: FacilitatorLoginDto): Promise<AuthPortalResponseDto> {
    try {
      const res = await auth.api.signInEmail({
        body: {
          email: dto.email,
          password: dto.password,
        },
      });
      return {
        authenticated: true,
        token: res.token,
        user: {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: (res.user as any).role || 'FACILITATOR',
          organization: (res.user as any).organization || 'Rikolto RDC - Projet AVENIR',
          province: (res.user as any).province || 'Kwilu',
        },
      };
    } catch {
      throw new UnauthorizedException('Identifiants invalides');
    }
  }

  @Get('users')
  @ApiOperation({
    summary: 'Lister tous les utilisateurs et animateurs (pour l’administration)',
  })
  @ApiResponse({ status: 200, type: [AuthPortalUserDto] })
  async listUsers(): Promise<AuthPortalUserDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      organization: u.organization || 'Rikolto RDC - Projet AVENIR',
      province: u.province || 'Kwilu',
    }));
  }

  @Put('users/:id')
  @ApiOperation({
    summary: 'Mettre à jour le rôle ou les informations d’un utilisateur',
  })
  @ApiResponse({ status: 200, type: AuthPortalUserDto })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: { role?: string; province?: string; organization?: string; name?: string },
  ): Promise<AuthPortalUserDto> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.role ? { role: dto.role } : {}),
        ...(dto.province ? { province: dto.province } : {}),
        ...(dto.organization ? { organization: dto.organization } : {}),
        ...(dto.name ? { name: dto.name } : {}),
      },
    });
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      organization: updated.organization || 'Rikolto RDC - Projet AVENIR',
      province: updated.province || 'Kwilu',
    };
  }

  @Delete('users/:id')
  @ApiOperation({
    summary: 'Supprimer un utilisateur',
  })
  async deleteUser(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async handleRawBetterAuth(req: Request, res: Response) {
    return this.betterAuthHandler(req, res);
  }
}

