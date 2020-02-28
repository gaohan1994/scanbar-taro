
import Taro from '@tarojs/taro'; 
import { View, Text } from '@tarojs/components';
import "../../pages/style/member.less";
import "../../pages/style/product.less";
import { ViewProps } from '@tarojs/components/types/View';

const cssPrefix = 'product';
const memberPrefix = 'member'

type Props = { 
  badge?: number | string;
  title: number | string;
} & ViewProps;

class ButtonCostom extends Taro.Component<Props> {
  static defaultProps = {
    badge: undefined,
    title: '',
  };

  render () {
    const { title, badge, onClick } = this.props;
    return (
      <View 
        className={`${memberPrefix}-main-header-add`}
        onClick={onClick}
      >
        {badge !== undefined && badge !== 0 && (
          <View className={`${cssPrefix}-header-suspension`}>{badge}</View>
        )}
        <Text className={`${memberPrefix}-main-header-add-text`}>{title}</Text>
      </View>
    );
  }
}

export default ButtonCostom;