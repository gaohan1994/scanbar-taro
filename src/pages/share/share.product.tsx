/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-04-13 14:01:57
 */
import Taro from '@tarojs/taro';
import { View, Button } from '@tarojs/components';
import requestHttp from '../../common/request/request.http';
import { jsonToQueryString } from '../../constants';
import invariant from 'invariant';
import "./index.less";
import { ResponseCode } from '../../constants/index';

type Props = {

};

class Page extends Taro.Component<Props> {

  componentDidShow () {
    const { id } = this.$router.params;
    console.log('id:', id);
  }

  onClick = async () => {
    try {
      const { id = 276 } = this.$router.params;
      const result = await requestHttp.get(`/product/productInfo/getShareInfo${jsonToQueryString({
        merchantId: 1,
        productId: id
      })}`);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      
      Taro.navigateToMiniProgram({
        appId: result.data.appId,
        path: result.data.path,
        envVersion: 'trial',
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {
    const { id } = this.$router.params;
    return (
      <View className='container share'>
        <View className='share-img' />
        <View className='share-text'>
          你收到一个好物分享，快来围观吧
        </View>
        <Button
          onClick={this.onClick}
          className='share-button'
        >
          立即查看
        </Button>
      </View>
    );
  }
}

export default Page;