import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import isNaN from 'lodash/isNaN';
import classNames from 'classnames';
import './style.sass';

interface Props { 
  dot?: boolean;
  value?: any;
  maxValue?: any;
  customStyle?: any;
  className?: string;
}

export default class AtBadge extends Taro.Component<Props> {

  static defaultProps = {
    dot: false,
    value: '',
    maxValue: 99,
    customStyle: {},
    className: '',
  };

  formatValue (value: any, maxValue: any) {
    if (value === '' || value === null) {
      return '';
    }
    const numValue = +value;
    if (isNaN(numValue)) {
      return value;
    }
    return numValue > maxValue ? `${maxValue}+` : numValue;
  }

  render () {
    const {
      dot,
      value,
      maxValue,
      customStyle,
    } = this.props;
    const rootClassName = ['at-badge'];

    const val = this.formatValue(value, maxValue);

    return (
      <View
        className={classNames(rootClassName, this.props.className)}
        style={customStyle}
      >
        {this.props.children}
        {dot 
          ? <View className='at-badge__dot'/> 
          : val !== '' && 
            <View className='at-badge__num'>{val}</View>}
      </View>
    );
  }
}