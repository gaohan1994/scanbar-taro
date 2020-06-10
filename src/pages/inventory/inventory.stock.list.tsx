import Taro, { Config } from "@tarojs/taro";
import { View, Image, Text, ScrollView, Picker } from "@tarojs/components";
import { AppReducer } from "../../reducers";
import {
  getInventoryStockListTotal,
  getMerchantStockList
} from "../../reducers/app.inventory";
import { connect } from "@tarojs/redux";
import { InventoryInterface } from "../../constants";
import { InventoryAction, MemberAction, ProductAction } from "../../actions";
import { ResponseCode } from "../../constants/index";
import invariant from "invariant";
import "../style/product.less";
import "../style/member.less";
import "../style/inventory.less";
import HeaderInput from "../../component/header/header.input";
import InventoryItem from "../../component/inventory/inventoy.item";
import ModalLayout from "../../component/layout/modal.layout";
import dayJs from "dayjs";
import productSdk from "../../common/sdk/product/product.sdk";

const cssPrefix = "product";
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
  dateMin: string;
  dateMax: string;
};

class InventoryMerchantList extends Taro.Component<Props, State> {
  state = {
    searchValue: "",
    loading: false,
    visible: false,
    dateMin: dayJs().format("YYYY-MM-DD"),
    dateMax: dayJs().format("YYYY-MM-DD")
  };

  config: Config = {
    navigationBarTitleText: "盘点记录"
  };

  componentDidShow() {
    ProductAction.productInfoSupplier();
    this.fetchData(1);
  }

  public reset = () => {
    const today = dayJs().format("YYYY-MM-DD");
    this.setState({
      dateMin: today,
      dateMax: today
    });
  };

  /**
   * @todo [用户选择日期回调]
   *
   * @memberof MemberMain
   */
  public onDateMinChange = (event: any) => {
    this.setState({ dateMin: event.detail.value });
  };
  public onDateMaxChange = (event: any) => {
    this.setState({ dateMax: event.detail.value });
  };

  /**
   * @todo 绑定输入事件
   *
   * @memberof ProductOrder
   */
  public onInput = ({ detail }: any) => {
    this.setState({ searchValue: detail.value }, () => {
      this.fetchData(1);
    });
  };

  public fetchData = async (page?: number) => {
    try {
      const { searchValue, dateMin, dateMax } = this.state;
      const payload: InventoryInterface.InventoryStockListFetchField = {
        pageNum: typeof page === "number" ? page : pageNum,
        pageSize: 20
      };
      const today = dayJs().format("YYYY-MM-DD");
      if (searchValue !== "") {
        /**
         * @todo 如果是搜索搜索全局
         */
        payload.businessNumber = searchValue as any;
      } else {
        /**
         * @todo 如果不是搜索则按日期搜索
         */
        if (dateMin !== today || dateMax !== today) {
          payload.startTime = `${dateMin} 00:00:00`;
          payload.endTime = `${dateMax} 00:00:00`;
        }
      }
      const result = await InventoryAction.merchantStockList(payload);
      invariant(result.code === ResponseCode.success, result.msg || " ");
      if (typeof page === "number") {
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
  };

  public onChangeValue = (key: string, value: any) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [`${key}`]: value
      };
    });
  };

  public onStockClick = (stock: InventoryInterface.InventoryStockDetail) => {
    Taro.navigateTo({
      url: `/pages/inventory/inventory.stock.detail?id=${stock.businessNumber}`
    });
  };

  render() {
    const { searchValue } = this.state;
    return (
      <View className={`container ${cssPrefix}`}>
        <HeaderInput
          className="inventory-input-list"
          placeholder="请输入业务单号"
          value={searchValue}
          onInput={this.onInput}
          isRenderInputRight={true}
          inputRightClick={() => this.onInput({ detail: { value: "" } })}
        >
          <View
            className={"inventory-header-item inventory-header-item-pur"}
            onClick={() => this.onChangeValue("visible", true)}
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
          {stockListByDate &&
            stockListByDate.length > 0 &&
            stockListByDate.map(list => {
              const { data } = list;
              return (
                <View key={list.date}>
                  <View className={"inventory-list-time"}>
                    <View className="inventory-list-time-bor" />
                    <View className="inventory-list-time-time">
                      {list.date}
                    </View>
                  </View>
                  {data.map(item => {
                    return (
                      <InventoryItem
                        sort={
                          productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK
                        }
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
    return <View>kong</View>;
  };

  private renderModal = () => {
    const { visible, dateMin, dateMax } = this.state;

    return (
      <ModalLayout
        visible={visible}
        onClose={() => this.onChangeValue("visible", false)}
        contentClassName={`${cssPrefix}-layout`}
        title="筛选"
        buttons={[
          { title: "重置", onPress: () => this.reset(), type: "cancel" },
          {
            title: "确定",
            onPress: () => {
              this.onChangeValue("visible", false);
              this.fetchData(1);
            }
          }
        ]}
      >
        <View className={`inventory-select`}>
          <View className={`inventory-select-item inventory-select-item-nobor`}>
            <View className={`inventory-select-title`}>日期</View>
            <View className={"inventory-select-item-time"}>
              <Picker
                mode="date"
                onChange={this.onDateMinChange}
                value={dateMin}
              >
                <View className="inventory-select-item-button inventory-select-item-button-time">
                  {dateMin}
                </View>
              </Picker>
              <View className="inventory-select-item-bor" />
              <Picker
                mode="date"
                onChange={this.onDateMaxChange}
                value={dateMax}
              >
                <View className="inventory-select-item-button inventory-select-item-button-time">
                  {dateMax}
                </View>
              </Picker>
            </View>
          </View>
        </View>
      </ModalLayout>
    );
  };
}

const select = (state: AppReducer.AppState) => {
  const stockList = getMerchantStockList(state);
  const stockListByDate: any = MemberAction.fliterDataByDate(
    stockList as any,
    "makeTime"
  );
  return {
    stockList,
    stockListByDate,
    stockListTotal: getInventoryStockListTotal(state)
  };
};

export default connect(select)(InventoryMerchantList);
