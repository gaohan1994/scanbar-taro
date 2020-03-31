/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-31 11:44:23
 */
import Taro from '@tarojs/taro';
import { View, Button } from '@tarojs/components';

type Props = {

};

class Page extends Taro.Component<Props> {

  onShareAppMessage = (res) => {
    console.log('res: ', res);
    return {
      title: 'title',
      path: '/pages/share/share.product?id=276',
    };
  }

  render () {
    return (
      <View className='container'>
        <Button
          openType='share'
        >
          share
        </Button>
      </View>
    );
  }
}

export default Page;