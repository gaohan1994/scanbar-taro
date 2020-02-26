import Taro, { Config } from '@tarojs/taro';
import { View, Image, Text, ScrollView, Picker } from '@tarojs/components';
import { AppReducer } from '../../reducers';
import { getInventoryStockList, getInventoryStockListTotal } from '../../reducers/app.inventory';
import { connect } from '@tarojs/redux';
import { InventoryInterface } from '../../constants';
import { InventoryAction, MemberAction, ProductAction } from '../../actions';
import { ResponseCode } from '../../constants/index';
import invariant from 'invariant';
import "../style/product.less";
import "../style/member.less";
import "../style/inventory.less";
import { getProductSupplier } from '../../reducers/app.product';
import { ProductInterface } from '../../constants';
import HeaderInput from '../../component/header/header.input';
import InventoryItem from '../../component/inventory/inventoy.item';
import ModalLayout from '../../component/layout/modal.layout';
import merge from 'lodash.merge';
import classnames from 'classnames';
import dayJs from 'dayjs';

const cssPrefix = 'product';

let pageNum: number = 1;

type Props = {
  stockList: InventoryInterface.InventoryStockDetail[];
  stockListByDate: Array<{
    date: string;
    data: InventoryInterface.InventoryStockDetail[];
  }>;
  stockListTotal: number;
  supplier: ProductInterface.ProductSupplier[];
};

type State = { 
  searchValue: string;              
  loading: boolean;
  visible: boolean;
  selectSupplierId: any[];
  dateMin: string;
  dateMax: string;
  selectDateMin: string;
  selectDateMax: string;
};

class InventoryList extends Taro.Component<Props, State> {

  state = {
    searchValue: '',
    loading: false,
    visible: false,
    selectSupplierId: [],
    dateMin: dayJs().format('YYYY-MM-DD'),
    dateMax: dayJs().format('YYYY-MM-DD'),
    selectDateMin: '',
    selectDateMax: '',
  };

  config: Config = {
    navigationBarTitleText: '进货记录'
  };

  componentDidShow () {
    ProductAction.productInfoSupplier();
    this.fetchData(1);
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

  public reset = () => {
    const today = dayJs().format('YYYY-MM-DD');
    this.setState({
      selectSupplierId: [],
      dateMin: today,
      dateMax: today,
      selectDateMin: '',
      selectDateMax: '',
    });
  }

  public changeAll = (key: string = 'selectSupplierId') => {
    const { supplier } = this.props;
    this.setState(prevState => {
      const prevData = merge([], prevState[key]);
      let nextData: any[] = [];
      if (prevData.length === 0) {
        nextData = supplier.map((s) => s.id);
      }
      return {
        ...prevState,
        [key]: nextData
      };
    });
  }

  public changeSelectSupplier = (supplier: ProductInterface.ProductSupplier) => {
    this.setState(prevState => {
      const prevIds = merge([], prevState.selectSupplierId);
      const index = prevIds.findIndex(p => p === supplier.id);
      if (index === -1) {
        prevIds.push(supplier.id);
      } else {
        prevIds.splice(index, 1);
      }
      return {
        ...prevState,
        selectSupplierId: prevIds
      };
    });
  }

  /**
   * @todo [用户选择日期回调]
   *
   * @memberof MemberMain
   */
  public onDateMinChange = (event: any) => {
    this.setState({dateMin: event.detail.value, selectDateMin: event.detail.value});
  }
  public onDateMaxChange = (event: any) => {
    this.setState({dateMax: event.detail.value, selectDateMax: event.detail.value});
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
      const { searchValue, selectSupplierId, dateMin, dateMax } = this.state;
      let payload: InventoryInterface.InventoryStockListFetchField = {
        pageNum: typeof page === 'number' ? page : pageNum,
        pageSize: 20,
      };
      if (searchValue !== '') {
        payload.businessNumber = searchValue as any;
      }
      if (selectSupplierId && selectSupplierId.length > 0) {
        payload.supplierId = selectSupplierId.join(',');
      }
      const today = dayJs().format('YYYY-MM-DD');
      if (dateMin !== today || dateMax !== today) {
        payload.startTime = `${dateMin} 00:00:00`;
        payload.endTime = `${dateMax} 00:00:00`;
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
            className={'inventory-header-item inventory-header-item-pur'}
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
    const { visible, selectSupplierId, selectDateMin, selectDateMax } = this.state;
    const { supplier } = this.props;
    return (
      <ModalLayout
        visible={visible}
        onClose={() => this.onChangeValue('visible', false)}
        contentClassName={`${cssPrefix}-layout`}
        title="筛选"
        buttons={[
          {title: '重置', onPress: () => this.reset(), type: 'cancel'},
          {title: '确定', onPress: () => {
            this.onChangeValue('visible', false);
            this.fetchData(1);
          }},
        ]}
      >
        <View className={`inventory-select`}>
          <View className={`inventory-select-item`}>
            <View className={`inventory-select-title`}>日期</View>
            <View className={"inventory-select-item-time"}>
              <Picker
                mode='date'
                onChange={this.onDateMinChange} 
                value={selectDateMin}
              >
                <View className="inventory-select-item-button inventory-select-item-button-time">
                  {!selectDateMin ? '开始日期' : selectDateMin}
                </View>
              </Picker>
              <View className="inventory-select-item-bor"/>
              <Picker
                mode='date'
                onChange={this.onDateMaxChange} 
                value={selectDateMax}
              >
                <View className="inventory-select-item-button inventory-select-item-button-time">
                  {!selectDateMax ? '结束日期' : selectDateMax}
                </View>
              </Picker>
            </View>
          </View>

          <View className={`inventory-select-item`}>
            <View className={`inventory-select-title`}>供应商</View>
            <View className={"inventory-select-item-box"}>
              <View
                onClick={() => this.changeAll()}
                className={classnames(
                  'inventory-select-item-button', 
                  {'inventory-select-item-button-active': selectSupplierId.length === supplier.length}
                )}
              >
                全部
              </View>
              {
                supplier.map((item) => {
                  return (
                    <View 
                      key={item.id}
                      onClick={() => this.changeSelectSupplier(item)}
                      className={classnames("inventory-select-item-button", {
                        'inventory-select-item-button-active': selectSupplierId.some((t) => t === item.id),
                      })}
                    >
                      {item.name}
                    </View>
                  );
                })
              }
            </View>
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
    supplier: getProductSupplier(state),
  };
};

export default connect(select)(InventoryList);