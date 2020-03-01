import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import "./item.less"

const prefix = 'component-mine'

type Props = {

}

class Item extends Taro.Component<Props> {
  render () {
    return (
      <View className={`${prefix}-item`}>
        {this.props.children}
      </View>
    )
  }
}

export default Item;