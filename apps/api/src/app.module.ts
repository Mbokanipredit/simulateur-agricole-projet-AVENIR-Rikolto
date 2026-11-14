import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CropsModule } from './crops/crops.module';
import { SimulationsModule } from './simulations/simulations.module';
import { ToolboxModule } from './toolbox/toolbox.module';

@Module({
  imports: [PrismaModule, AuthModule, CropsModule, SimulationsModule, ToolboxModule],
})
export class AppModule {}

