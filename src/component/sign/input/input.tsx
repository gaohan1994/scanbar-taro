/*
 * @Author: Ghan 
 * @Date: 2019-10-31 17:10:38 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-11 17:13:41
 */
import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { AtInput } from 'taro-ui';
import "./input.less";
import { AtInputProps } from 'taro-ui/@types/input';
import merge from 'lodash/merge';

interface Props extends AtInputProps {
  icon?: any;
}

class CTInput extends Taro.Component<Props> {
  render () {
    const { icon } = this.props;
    const renderIcon: boolean = typeof icon === 'string';      
    
    let ATInputProps: any = merge({}, this.props);
    delete ATInputProps.icon;
    return (
      <View className={"input-card"}>
        {
          renderIcon === true
          ? (
            <Image src={icon} className="input-card-icon" />
          )
          : icon
        }
        <AtInput {...ATInputProps} placeholderClass="theme-input-placeholder" />
      </View>
    );
  }
}

export default CTInput;