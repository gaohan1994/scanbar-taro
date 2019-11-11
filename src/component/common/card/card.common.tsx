/*
 * @Author: Ghan 
 * @Date: 2019-11-01 14:06:03 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-01 14:08:52
 */
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { ViewProps } from '@tarojs/components/types/View';
import classnames from 'classnames';
// import { merge } from 'lodash';
import merge from 'lodash/merge';
import './card.less';

interface CardProps extends ViewProps {
  shadow?: boolean; // 是否显示阴影
}

export class Card extends Taro.Component<CardProps> {

  static externalClasses = ['card-class'];

  static defaultProps = {
    shadow: true
  };

  render () {
    const { shadow } = this.props;

    const CardViewProps: any = merge({}, this.props);
    delete CardViewProps.shadow;
    return (
      <View 
        {...CardViewProps}
        className={classnames({
          'theme-card': true, 
          'common-card': true,
          'theme-shadow': shadow,
          'card-class': true,
        })} 
      >
        {this.props.children}
      </View>
    );
  }
}