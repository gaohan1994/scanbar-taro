
import Taro from '@tarojs/taro';
import { View, ScrollView, Image, Text } from '@tarojs/components';
import './list.less';
import classnames from 'classnames';
import "taro-ui/dist/style/components/flex.scss";

interface Props {

}

class ProductList extends Taro.Component<Props> {
  render () {

    const data = new Array(20).fill({}).map((item, index) => {
      return { key: index };
    });

    return (
      <ScrollView
        className="trade-list"
        scrollY={true}
      >
        <View className="at-row at-row--wrap">
          {
            data.map((item) => {
              return (
                <View 
                  key={`${item}`}
                  className={classnames('trade-list-box at-col at-col-6')}
                >
                  <View
                    className="trade-list-item "
                  >
                    <Image 
                      src="https://img11.360buyimg.com/babel/s700x360_jfs/t1/4776/39/2280/143162/5b9642a5E83bcda10/d93064343eb12276.jpg!q90!cc_350x180" 
                      className="trade-list-item-cover"
                      mode="center"
                    />
                    <View className="trade-list-item-detail">  
                      <Text className="trade-list-title">二手图书二手图书</Text>
                      <View className="trade-list-item-detail-bar trade-list-border">
                        <Text className="trade-list-price">￥69.99</Text>
                      </View>
                      <View className="trade-list-item-detail-bar">
                        <Image src="http://net.huanmusic.com/wx/icon_wechat.png" className="trade-list-item-detail-icon" />
                        <View className="trade-list-item-detail-name" >
                          <Text className="trade-list-name">卖家姓名</Text>
                          <Text className="trade-list-name">福建师大苍山校区</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          }
        </View>
      </ScrollView>
    );
  }
}

export default ProductList;