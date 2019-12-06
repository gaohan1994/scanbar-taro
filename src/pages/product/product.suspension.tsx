/**
 * @Author: Ghan 
 * @Date: 2019-11-13 09:41:02 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-06 11:58:59
 * 
 */
import Taro from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components';
import "../style/product.less";
import "../style/member.less";
import CartBar from '../../component/cart/cart';
import { AppReducer } from '../../reducers';
import { connect } from '@tarojs/redux';
import classnames from 'classnames';
import ProductComponent from '../../component/product/product';
import { getSuspensionCartList, ProductSDKReducer } from '../../common/sdk/product/product.sdk.reducer';

const cssPrefix = 'product';

interface Props {
  suspensionCartList: ProductSDKReducer.SuspensionCartBase[];
}

interface State {
  currentSuspension: string;
}

class ProductSuspension extends Taro.Component<Props, State> {

  public componentDidShow () {
    const { suspensionCartList } = this.props;
    if (suspensionCartList.length > 0) {
      this.setState({ currentSuspension: suspensionCartList[0].suspension.date });
    }
  }

  render () {
    return (
      <View className={`container ${cssPrefix}`}>
        <View className={`${cssPrefix}-list-container`}>
          {this.renderLeft()}  
          {this.renderRight()}
        </View>
        <CartBar />
      </View>
    );
  }
  
  private renderLeft = () => {
    const { suspensionCartList } = this.props;
    return (
      <ScrollView 
        scrollY={true}
        className={`${cssPrefix}-list-left`}
      >
        {
          suspensionCartList && suspensionCartList.length > 0
            ? suspensionCartList.map((suspension) => {
              
              return (
                <View 
                  key={suspension.suspension.date}
                  className={classnames(`${cssPrefix}-list-left-item`, {
                    // [`${cssPrefix}-list-left-item-active`]: searchValue === '' && pureProductSearchList.length === 0 && list.typeInfo.id === currentType.id
                  })}
                  // onClick={() => this.onTypeClick(list)}
                >
                  {/* {searchValue === '' && pureProductSearchList.length === 0 && list.typeInfo.id === currentType.id && (
                    <View className={`${cssPrefix}-list-left-item-active-bge`} />
                  )} */}
                  {/* {list.typeInfo.name} */}
                  {suspension.suspension.date}
                </View>
              );
            })
            : <View />
        }
      </ScrollView>
    );
  }

  private renderRight = () => {
    const { currentSuspension } = this.state;
    const { suspensionCartList } = this.props;
    const currentSuspensionList = suspensionCartList.find(s => s.suspension.date === currentSuspension);
    return (
      <View className={`${cssPrefix}-list-right`}>
        <ScrollView 
          scrollY={true}
          className={`${cssPrefix}-list-right ${cssPrefix}-list-right-container`}
        >
          {
            currentSuspensionList && currentSuspensionList.productCartList.map((product) => {
              return (
                <View    
                  id={`product${product.id}`}
                  className="product-component-base1"
                  key={product.id}
                >
                  <ProductComponent
                    product={product}
                  />  
                </View>
              );
            })
          }
        </ScrollView>  
      </View> 
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  suspensionCartList: getSuspensionCartList(state)
});

export default connect(select)(ProductSuspension);