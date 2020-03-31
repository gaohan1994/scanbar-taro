/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-31 11:45:09
 */
import Taro from '@tarojs/taro';
import { View, Button } from '@tarojs/components';
import requestHttp from '../../common/request/request.http';
import { jsonToQueryString } from '../../constants';
import invariant from 'invariant';
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
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {
    return (
      <View className='container'>
        <Button
          onClick={this.onClick}
        >
          scanbar C
        </Button>
      </View>
    );
  }
}

export default Page;