import Taro from '@tarojs/taro';
import { View, Image, Text, ScrollView } from '@tarojs/components';
import { AppReducer } from '../../reducers';
import { getInventoryStockList, getInventoryStockListTotal } from '../../reducers/app.inventory';
import { connect } from '@tarojs/redux';
import { InventoryInterface } from '../../constants';
import { InventoryAction, MemberAction } from '../../actions';
import { ResponseCode } from '../../constants/index';
import invariant from 'invariant';
import "../style/product.less";
import "../style/member.less";
import "../style/inventory.less";
import CartBar from '../../component/cart/cart';
import { ProductAction } from '../../actions';
import { getProductSearchList, getSelectProduct, getProductType, getProductList } from '../../reducers/app.product';
import { ProductInterface } from '../../constants';
import productSdk from '../../common/sdk/product/product.sdk';
import HeaderInput from '../../component/header/header.input';
import ProductListView from '../../component/product/product.listview';
import TabsHeader from '../../component/layout/tabs.header';
import InventoryItem from '../../component/inventory/inventoy.item';
import ModalLayout from '../../component/layout/modal.layout';

const cssPrefix = 'product';

let pageNum: number = 1;

type Props = {
  stockList: InventoryInterface.InventoryStockDetail[];
  stockListByDate: Array<{
    date: string;
    data: InventoryInterface.InventoryStockDetail[];
  }>;
  stockListTotal: number;
};

type State = { 
  searchValue: string;              
  loading: boolean;
  visible: boolean;
};

class InventoryList extends Taro.Component<Props, State> {

  state = {
    searchValue: '',
    loading: false,
    visible: false,
  };

  componentDidShow () {
    this.fetchData();
  }

  /**
   * @todo 绑定输入事件
   *
   * @memberof ProductOrder
   */
  public onInput = ({detail}: any) => {
    this.setState({searchValue: detail.value}, () => {
      this.fetchData(1);
    });
  }

  public onChangeValue = (key: string, value: any) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [`${key}`]: value
      };
    });
  }

  public fetchData = async (page?: number) => {
    try {
      const { searchValue } = this.state;
      let payload: InventoryInterface.InventoryStockListFetchField = {
        pageNum: typeof page === 'number' ? page : pageNum,
        pageSize: 20,
      };
      if (searchValue !== '') {
        payload.businessNumber = searchValue as any;
      }
      const result = await InventoryAction.inventoryStockList(payload);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      if (typeof page === 'number') {
        pageNum = page;
      } else {
        pageNum += 1;
      }
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  }

  public onStockClick = (stock: InventoryInterface.InventoryStockDetail) => {
    Taro.navigateTo({
      url: `/pages/inventory/inventory.purchase.detail?id=${stock.businessNumber}`
    });
  }

  render () {
    const { searchValue } = this.state;
    return (
      <View className={`container ${cssPrefix}`}>
        <HeaderInput
          className="inventory-input-list"
          placeholder="请输入业务单号"
          value={searchValue}
          onInput={this.onInput}
          isRenderInputRight={true}
          inputRightClick={() => this.onInput({detail: {value: ''}})}
        >
          <View 
            className={'inventory-header-item'}
            onClick={() => this.onChangeValue('visible', true)}
          >
            <Image 
              src="//net.huanmusic.com/weapp/icon_shaixuan.png" 
              className={`inventory-header-item-sort`} 
            />
            <Text className="inventory-header-item-text">筛选</Text>
          </View>
        </HeaderInput>
        {this.renderList()}
        {this.renderModal()}
      </View>
    );
  }

  private renderList = () => {
    const { stockList, stockListByDate, stockListTotal } = this.props;
    const hasMore = stockList.length < stockListTotal;
    if (stockList && stockList.length > 0) {
      return (
        <ScrollView 
          scrollY={true}
          className={`inventory-list`}
          onScrollToLower={() => {
            if (hasMore) {
              this.fetchData();
            }
          }}
        >
          {stockListByDate && stockListByDate.length > 0 && stockListByDate.map((list) => {
            const { data } = list;
            return (
              <View key={list.date} >
                <View className={'inventory-list-time'}>
                  <View className="inventory-list-time-bor"/>
                  <View className="inventory-list-time-time">{list.date}</View>
                </View>
                {data.map((item) => {
                  return (
                    <InventoryItem
                      key={item.businessNumber}
                      inventory={item}
                    />
                  );
                })}
              </View>
            );
          })}
          {!hasMore && (
            <View className={`inventory-list-bottom`}>已经到底了</View>
          )}
        </ScrollView>
      );
    }
    return (
      <View>kong</View>
    );
  }

  private renderModal = () => {
    const { visible } = this.state;
    
    return (
      <ModalLayout
        visible={visible}
        onClose={() => this.onChangeValue('visible', false)}
        contentClassName={`${cssPrefix}-layout`}
        title="筛选"
        buttons={[
          {title: '重置', onPress: () => this.onChangeValue('visible', false), type: 'cancel'},
          {title: '确定', onPress: () => this.onChangeValue('visible', false)},
        ]}
      >
        <View className={`inventory-select`}>
          <View className={`inventory-select-item`}>
            <View className={`inventory-select-title`}>日期</View>
          </View>
        </View>
      </ModalLayout>
    );
  }
}

const select = (state: AppReducer.AppState) => {
  const stockList = getInventoryStockList(state);
  const stockListByDate: any = MemberAction.fliterDataByDate(stockList as any, 'makeTime');

  return {
    stockList,
    stockListByDate,
    stockListTotal: getInventoryStockListTotal(state),
  };
};

export default connect(select)(InventoryList);