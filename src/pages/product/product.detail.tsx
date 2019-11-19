import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { ProductAction } from '../../actions';
import invariant from 'invariant';
import { ResponseCode, ProductInterface } from '../../constants/index';
import './style/product.less';
import { AppReducer } from '../../reducers';
import { getProductDetail } from '../../reducers/app.product';
import { connect } from '@tarojs/redux';
import { FormRowProps } from '../../component/card/form.row';
import FormCard from '../../component/card/form.card';
import { AtButton } from 'taro-ui';
import merge from 'lodash/merge';

const cssPrefix = 'product';

interface Props { 
  productDetail: ProductInterface.ProductInfo;
}

interface State {
  productDetail: ProductInterface.ProductInfo;
}

class ProductDetail extends Taro.Component<Props, State> {
  constructor (props: Props) {
    super(props);
    this.state = {
      productDetail: {
        id: -1,
        cost: -1,
        limitNum: -1,
        memberPrice: -1,
        merchantId: -1,
        number: -1,
        price: -1,
        saleType: -1,
        status: -1,
        type: -1,
        barcode: '',
        brand: '',
        pictures: '',
        standard: '',
        supplier: '',
        unit: '',
        firstLetter: '',
        name: '',
        updateBy: '',
        createBy: '',
        createTime: '',
        updateTime: '',
      }
    };
  }

  componentWillMount = () => {
    const { id } = this.$router.params;
    if (!id) {
      console.error('请传入商品id');
      return;
    }
    this.fetchProductDetail(id);
  }

  public fetchProductDetail = async (id: string) => {
    try {
      const result = await ProductAction.productInfoDetail({id: Number(id)});
      invariant(result.code === ResponseCode.success, ResponseCode.error);
      this.setState({ productDetail: merge({}, result.data)});
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {
    const { productDetail } = this.props;
    const formName: FormRowProps[] = [
      {
        title: '条码',
        extraText: productDetail.barcode || '',
        extraThumb: '//net.huanmusic.com/weapp/icon_commodity_scan.png',
        buttons: [
          {
            title: '重新生成',
            type: 'confirm',
            onPress: () => {}
          }
        ],
      },
      {
        title: '名称',
        extraText: productDetail.name,
        hasBorder: false
      }
    ];
    const formDetail: FormRowProps[] = [
      {
        title: '类别',
        extraText: '饮料',
        arrow: 'right'
      },
      {
        title: '规格',
      },
      {
        title: '单位',
        extraText: productDetail.unit || '未指定',
      },
      {
        title: '品牌',
        extraText: productDetail.brand || '未指定',
        hasBorder: false
      },
    ];
    const formPrice: FormRowProps[] = [
      {
        title: '进价',
        extraText: `￥${productDetail.cost}`,
        arrow: 'right'
      },
      {
        title: '售价',
        extraText: `￥${productDetail.price}`,
        arrow: 'right'
      },
      {
        title: '会员价',
        extraText: `￥${productDetail.memberPrice}`,
        arrow: 'right',
        hasBorder: false
      },
    ];
    return (
      <View className="container">
        <View className={`${cssPrefix}-detail-cover`}>
          <Image src={productDetail.pictures} className={`${cssPrefix}-detail-cover-image`} />
        </View>
        <View className={`${cssPrefix}-detail-list`}>
          <FormCard items={formName} />
          <FormCard items={formDetail} />
          <FormCard items={formPrice} />

          <View className={`${cssPrefix}-detail-submit`}>
            <AtButton
              className={`theme-button`}
            >
              保存
            </AtButton>
          </View>
        </View>
      </View>
    );
  }
}

const mapState = (state: AppReducer.AppState) => ({
  productDetail: getProductDetail(state)
});

export default connect(mapState)(ProductDetail);