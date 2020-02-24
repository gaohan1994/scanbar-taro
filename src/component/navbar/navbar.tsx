import Taro, { Config } from '@tarojs/taro';
import { View, Image, Text, Input } from '@tarojs/components';
import classnames from 'classnames';
import './navbar.less';

const cssPrefix = 'component-navbar';

type Props = {
  title: string;
};
type State = {};

class NavBar extends Taro.Component<Props, State> {
  
  render() {
    const { title } = this.props;
    return (
      <View className={`${cssPrefix}`}>
        <View className={`${cssPrefix}-text`}>
          {title}
        </View>    
      </View>
    );
  }
}

export default NavBar;