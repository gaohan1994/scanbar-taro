import Taro from '@tarojs/taro';
import { View, Input } from '@tarojs/components';
import { InputProps } from '@tarojs/components/types/Input';

type HookInputProps = {
  title: string;
  onChange: (value: any) => void;
} & InputProps;

function HookInput (props: HookInputProps) {
  const { title, onChange, ...rest } = props;
  return (
    <View>
      {title}
      <Input
        {...rest}
        onInput={({detail: {value}}) => onChange(value)}
      />
    </View>
  );
}

export default HookInput;