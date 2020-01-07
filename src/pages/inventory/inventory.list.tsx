import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AppReducer } from '../../reducers';
import { getInventoryStockList } from '../../reducers/app.inventory';
import { connect } from '@tarojs/redux';
import { InventoryInterface } from '../../constants';
import { InventoryAction } from '../../actions';
import { ResponseCode } from '../../constants/index';
import invariant from 'invariant';

let pageNum: number = 1;

type Props = {
  stockList: InventoryInterface.InventoryStockDetail[];
};

class InventoryList extends Taro.Component<Props> {

  componentDidShow () {
    this.fetchData();
  }

  public fetchData = async (page?: number) => {
    try {
      const payload: InventoryInterface.InventoryStockListFetchField = {
        pageNum: typeof page === 'number' ? page : pageNum,
        pageSize: 20,
      };
      const result = await InventoryAction.inventoryStockList(payload);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
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
    return (
      <View className="container">
        {this.renderList()}
      </View>
    );
  }

  private renderList = () => {
    const { stockList } = this.props;
    return (
      <View>
        {stockList && stockList.length > 0 && stockList.map((stock) => {
          return (
            <View 
              key={stock.businessNumber}
              onClick={() => this.onStockClick(stock)}
            >
              {stock.businessNumber}
              {stock.makeTime}
              {stock.amount}
            </View>
          );
        })}
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  stockList: getInventoryStockList(state),
});

export default connect(select)(InventoryList);