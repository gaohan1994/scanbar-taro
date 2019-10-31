import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtForm, AtSwitch, AtSlider } from 'taro-ui';

export class TestControl extends Taro.Component {
  render () {
    return (
      <View>
        <AtForm>
          <AtSwitch title='开启中' />
          <AtSwitch title='已禁止' disabled={true} />
          <AtSwitch border={false} title='已关闭' />

          <AtSlider />
          <AtSlider value={50} />
          <AtSlider step={2} />
          <AtSlider min={10} max={60} />
        </AtForm>
      </View>
    );
  }
}