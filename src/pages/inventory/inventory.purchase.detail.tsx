import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AppReducer } from '../../reducers';
import { getInventoryStockDetail } from '../../reducers/app.inventory';
import { connect } from '@tarojs/redux';
import { InventoryInterface } from '../../constants';
import { InventoryAction } from '../../actions';

type Props = {
  stockDetail: InventoryInterface.InventoryStockDetail;
};

class InventoryPurchaseDetail extends Taro.Component<Props> {

  componentWillMount() {
    const { id } = this.$router.params;
    InventoryAction.stockDetail(id);
  }

  /**
   * @todo [继续进货，这里直接返回上一级路由]
   */
  public onPurchase = () => {
    const { entry } = this.$router.params;
    if (entry && entry === 'inventory') {
      Taro.navigateBack({});
      return;
    }
    Taro.navigateTo({
      url: '/pages/inventory/inventory.main'
    });
  }

  render () {
    return (
      <View className={'container'}>
        {this.renderProduct()}
        {this.renderButton()}
      </View>
    );
  }

  private renderProduct = () => {
    const { stockDetail } = this.props;
    return (
      <View>
        {stockDetail.detailList && stockDetail.detailList.map((product) => {
          return (
            <View key={product.id}>
              {`
              ${product.productName}
              ${product.number}
              ${product.cost}
              `}
            </View>
          );
        })}
      </View>
    );
  }

  private renderButton = () => {
    return (
      <View onClick={() => this.onPurchase()}>
        继续进货
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  stockDetail: getInventoryStockDetail(state),
});

export default connect(select)(InventoryPurchaseDetail);