import React, { useEffect, useState } from 'react';
import { XStack, YStack, Text, Button, Input } from 'tamagui';
import { Minus, Plus } from 'lucide-react';

interface NumberInputWithStepperProps {
  value: number;
  onChange: (nextVal: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unitLabel?: string;
  placeholder?: string;
  compact?: boolean;
}

export const NumberInputWithStepper: React.FC<NumberInputWithStepperProps> = ({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 1000000,
  unitLabel,
  placeholder = '0',
  compact = false,
}) => {
  const [textVal, setTextVal] = useState<string>(String(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setTextVal(Number.isFinite(value) ? String(Number(value.toFixed(2))) : '0');
    }
  }, [value, isFocused]);

  const handleTextChange = (raw: string) => {
    setTextVal(raw);
    const normalized = raw.replace(',', '.');
    if (normalized === '' || normalized === '.' || normalized.endsWith('.')) {
      return;
    }
    const parsed = parseFloat(normalized);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const normalized = textVal.replace(',', '.');
    const parsed = parseFloat(normalized);
    if (Number.isNaN(parsed)) {
      setTextVal(String(Number(value.toFixed(2))));
    } else {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
      setTextVal(String(Number(clamped.toFixed(2))));
    }
  };

  const handleStep = (delta: number) => {
    const next = Math.min(max, Math.max(min, Number((value + delta).toFixed(2))));
    onChange(next);
    setTextVal(String(next));
  };

  const height = compact ? 38 : 44;
  const btnWidth = compact ? 36 : 42;

  return (
    <XStack
      height={height}
      backgroundColor="#FFFFFF"
      borderRadius={10}
      borderWidth={1.5}
      borderColor={isFocused ? '#1F6338' : '#D5DDD5'}
      alignItems="center"
      overflow="hidden"
    >
      <Button
        width={btnWidth}
        height={height}
        borderRadius={0}
        backgroundColor="#F3F7F3"
        borderRightWidth={1}
        borderRightColor="#E2E9E2"
        padding={0}
        onPress={() => handleStep(-step)}
      >
        <Minus size={compact ? 14 : 16} color="#1F6338" />
      </Button>

      <XStack flex={1} alignItems="center" paddingHorizontal="$2.5">
        <Input
          flex={1}
          height={height - 4}
          borderWidth={0}
          backgroundColor="transparent"
          fontSize={compact ? 14 : 15}
          fontWeight="800"
          color="#18241B"
          textAlign="center"
          value={textVal}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onChangeText={handleTextChange}
        />
        {unitLabel && (
          <YStack
            backgroundColor="#E7F3E7"
            paddingHorizontal="$2"
            paddingVertical={2}
            borderRadius={6}
          >
            <Text fontSize={11} fontWeight="700" color="#1F6338">
              {unitLabel}
            </Text>
          </YStack>
        )}
      </XStack>

      <Button
        width={btnWidth}
        height={height}
        borderRadius={0}
        backgroundColor="#1F6338"
        padding={0}
        onPress={() => handleStep(step)}
      >
        <Plus size={compact ? 14 : 16} color="#FFFFFF" />
      </Button>
    </XStack>
  );
};

