/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-30 10:16:35
 */
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';

type Props = {

};

class Page extends Taro.Component<Props> {

  public navTo = () => {
    
  }

  render () {
    return (
      <View className='container'>
        <View onClick={() => this.navTo()}>
          navto
        </View>
      </View>
    );
  }
}

export default Page;