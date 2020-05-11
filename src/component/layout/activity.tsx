import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "../product/product.less";
import { ProductInterface } from "src/constants";
import classnames from "classnames";
import productSdk from "../../common/sdk/product/product.sdk";

const cssPrefix = "component-product";

type Props = {
  product: ProductInterface.ProductInfo;
  sort: string;
};

class ActivityComponent extends Taro.Component<Props> {
  render() {
    const { product, sort } = this.props;
    const { activityInfos } = product;

    if (sort !== productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER) {
      return <View />;
    }

    /**
     * @todo 如果没有活动或者说库存>10则不显示
     */
    if (!activityInfos && product.number > 10) {
      return <View />;
    }

    return (
      <View className={`${cssPrefix}-activity`}>
        {product.number < 10 && (
          <View className={`${cssPrefix}-inventory`}>
            {`仅剩${product.number}份`}
          </View>
        )}

        {activityInfos.map(activity => {
          return (
            <View
              key={activity.name}
              className={classnames({
                [`${cssPrefix}-discount`]: true
              })}
            >
              {activity.name}
            </View>
          );
        })}
      </View>
    );
  }
}

export default ActivityComponent;
