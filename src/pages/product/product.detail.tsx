import Taro from '@tarojs/taro';
import { View, Image, Picker } from '@tarojs/components';
import { ProductAction } from '../../actions';
import invariant from 'invariant';
import { ResponseCode, ProductInterface } from '../../constants/index';
import './style/product.less';
import { AppReducer } from '../../reducers';
import { getProductDetail, getProductType } from '../../reducers/app.product';
import { connect } from '@tarojs/redux';
import { FormRowProps } from '../../component/card/form.row';
import FormCard from '../../component/card/form.card';
import { AtButton, AtActivityIndicator } from 'taro-ui';
import merge from 'lodash/merge';
import classnames from 'classnames';
import FormRow from '../../component/card/form.row';
import Modal from '../../component/modal/modal';
import "../../component/card/form.card.less";
import numeral from 'numeral';

export function generateModalButtons (confirmCallback: any, cancelCallback: any) {
  return [
    {
      title: '取消',
      type: 'cancel',
      onPress: cancelCallback
    },
    {
      title: '确定',
      type: 'confirm',
      onPress: confirmCallback
    },
  ];
}

const cssPrefix = 'product';

/**
 * @param {productDetail} 商品详情
 * @param {productType} 商品品类
 * @param {productTypeSelector} 商品品类picker选择器数据
 *
 * @author Ghan
 * @interface Props
 */
interface Props { 
  productDetail: ProductInterface.ProductInfo;
  productType: ProductInterface.ProductType[];
  productTypeSelector: string[];
}

interface State {
  /**
   * @param {productDetail} 商品详情 
   */
  productDetail: ProductInterface.ProductInfo;
  /**
   * @param {productChangeDetail} 修改了哪些商品项
   */
  productChangeDetail: Partial<ProductInterface.ProductInfo>;
  typeModalVisible: boolean;
  typePickerValue: number;
  costModalVisible: boolean;
  priceModalVisible: boolean;
  memberPriceModalVisible: boolean;
  numberModalVisible: boolean;
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
        typeId: -1,
        typeName: '',
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
        imgs: [],
      },
      productChangeDetail: {},
      typeModalVisible: true,
      typePickerValue: 2,
      costModalVisible: false,
      priceModalVisible: false,
      memberPriceModalVisible: false,
      numberModalVisible: false,
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
      /**
       * @todo 初始化商品详情
       */
      const result = await ProductAction.productInfoDetail({id: Number(id)});
      invariant(result.code === ResponseCode.success, ResponseCode.error);
      const productDetail: ProductInterface.ProductInfo = merge({}, result.data);
      this.setState({ 
        productDetail,
        productChangeDetail: {}
      });

      /**
       * @todo 初始化typepicker的位置
       */
      const typeResult = await ProductAction.productInfoType();  
      invariant(typeResult.code === ResponseCode.success, ResponseCode.error);
      const productType: ProductInterface.ProductType[] = typeResult.data;
      this.setState({
        typePickerValue: productType.findIndex(t => t.id === productDetail.typeId)
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  /**
   * @todo 修改商品类别
   *
   * @memberof ProductDetail
   */
  public changeProductType = (event: any) => {
    try {
      const { productType } = this.props;
      const typeIndex: number = event.detail.value;
      const type = productType[typeIndex];

      if (!type) {
        throw new Error('未找到指定的品类，请联系客服');
      }

      this.setState(prevState => {
        return {
          ...prevState,
          productChangeDetail: {
            ...prevState.productChangeDetail,
            type: type.id,
            typeName: type.name
          }
        };
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public changeModalVisible = (key: string, visible?: boolean) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: typeof visible === 'boolean' ? visible : !prevState[key]
      };
    });
  }

  public onCostChange = (value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        productChangeDetail: {
          ...prevState.productChangeDetail,
          cost: Number(value),
        }
      };
    });
  }

  public onPriceChange = (value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        productChangeDetail: {
          ...prevState.productChangeDetail,
          price: Number(value)
        }
      };
    });
  }
  public onMemberPriceChange = (value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        productChangeDetail: {
          ...prevState.productChangeDetail,
          memberPrice: Number(value)
        }
      };
    });
  }

  public onNumberChange = (value: string) => {
    this.setState({
      productChangeDetail: {
        ...this.state.productChangeDetail,
        number: Number(value)
      }
    });
  }

  public onScanHandle = () => {
    console.log('onScanHandle: ');

  }

  /**
   * @todo 保存函数
   *
   * @memberof ProductDetail
   */
  public submit = async () => {
    try {
      Taro.showLoading();
      const { productChangeDetail } = this.state;
      const { productDetail } = this.props;
      /**
       * @todo 如果没有修改则退出该页面
       */
      const keys = Object.keys(productChangeDetail);
      if (keys.length === 0) {
        Taro.navigateBack();
        return;
      }

      /**
       * @todo 组成请求函数
       */
      let payload: Partial<ProductInterface.ProductInfo> = {
        id: productDetail.id
      };
      
      keys.forEach((key) => {

        /**
         * @todo 价格只有改动过的才提交
         */
        if (
          key === 'cost' ||
          key === 'memberPrice' ||
          key === 'price'
        ) {
          if (Number(productChangeDetail[key]) !== Number(productDetail[key])) {
            payload[key] = Number(productChangeDetail[key]);
          }
        } else {
          payload[key] = productChangeDetail[key];
        }
      });
      const result = await ProductAction.productInfoEdit(payload);
      Taro.hideLoading();
      invariant(result.code === ResponseCode.success, result.msg || ResponseCode.error);
      Taro.showToast({
        title: '保存成功!',
        icon: 'success',
        success: () => {
          Taro.navigateBack();
        }
      });
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {
    const { productDetail, productChangeDetail, typePickerValue } = this.state;
    const { productTypeSelector } = this.props;
    const formName: FormRowProps[] = [
      {
        title: '条码',
        extraText: productDetail.barcode || '',
        extraThumb: '//net.huanmusic.com/weapp/icon_commodity_scan.png',
        buttons: [
          {
            title: '重新生成',
            type: 'confirm',
            onPress: () => this.onScanHandle()
          }
        ],
      },
      {
        title: '名称',
        extraText: productChangeDetail.name || productDetail.name,
        hasBorder: false
      }
    ];
    const formDetail: FormRowProps[] = [
      {
        title: '规格',
      },
      {
        title: '单位',
        extraText: productChangeDetail.unit || productDetail.unit || '未指定',
      },
      {
        title: '品牌',
        extraText: productChangeDetail.brand || productDetail.brand || '未指定',
        hasBorder: false
      },
    ];
    const formNumber: FormRowProps[] = [
      {
        title: '库存',
        extraText: `${numeral(productChangeDetail.number || productDetail.number).value()}`,
        onClick: () => this.changeModalVisible('numberModalVisible', true)
      },
    ];
    const formPrice: FormRowProps[] = [
      {
        title: '进价（￥）',
        extraText: `${numeral(productChangeDetail.cost || productDetail.cost).format('0.00')}`,
        onClick: () => this.changeModalVisible('costModalVisible', true)
      },
      {
        title: '售价（￥）',
        extraText: `${numeral(productChangeDetail.price || productDetail.price).format('0.00')}`,
        onClick: () => this.changeModalVisible('priceModalVisible', true)
      },
      {
        title: '会员价（￥）',
        extraText: `${numeral(productChangeDetail.memberPrice || productDetail.memberPrice).format('0.00')}`,
        onClick: () => this.changeModalVisible('memberPriceModalVisible', true),
        hasBorder: false
      },
    ];
    
    if (productDetail.id !== -1) {
      return (
        <View className="container">
          <View className={`${cssPrefix}-detail-cover`}>
            <Image src={productDetail.pictures} className={`${cssPrefix}-detail-cover-image`} />
          </View>
          <View className={`${cssPrefix}-detail-list`}>
            <FormCard items={formName} />
            <FormCard items={formPrice} />
            <View 
              className={classnames('component-form', {
                'component-form-shadow': true
              })}
            >
              <Picker 
                mode="selector"
                range={productTypeSelector}
                onChange={this.changeProductType}
                value={typePickerValue}
              >
                <FormRow 
                  title="类别"
                  extraText={productChangeDetail.typeName || productDetail.typeName}
                  arrow="right"
                />
              </Picker>
            </View>
            <FormCard items={formNumber} />
            <FormCard items={formDetail} />
  
            <View className={`${cssPrefix}-detail-submit`}>
              <AtButton
                className={`theme-button`}
                onClick={() => this.submit()}
              >
                保存
              </AtButton>
            </View>
          </View>
          {this.renderModals()}
        </View>
      );
    }
    return (
      <View className="container">
        <AtActivityIndicator mode="center" />
      </View>
    );
  }

  private renderModals = () => {
    const { 
      costModalVisible, 
      priceModalVisible, 
      memberPriceModalVisible,
      numberModalVisible,
      productDetail,
      productChangeDetail
    } = this.state;

    const costForm: FormRowProps[] = [
      {
        title: '进价调整为',
        isInput: true,
        inputType: 'number',
        inputValue: `${productChangeDetail.cost || ''}`,
        inputOnChange: this.onCostChange,
      },
      {
        title: '进价差额',
        extraText: `${productChangeDetail.cost !== undefined && String(productChangeDetail.cost) !== '' 
          ? numeral(productChangeDetail.cost).value() - numeral(productDetail.cost).value() 
          : ''}`,
        hasBorder: false,
      },
    ];
    const priceForm: FormRowProps[] = [
      {
        title: '售价调整为',
        isInput: true,
        inputType: 'number',
        inputValue: `${productChangeDetail.price || ''}`,
        inputOnChange: this.onPriceChange,
      },
      {
        title: '售价差额',
        extraText: `${productChangeDetail.price !== undefined && String(productChangeDetail.price) !== '' 
          ? numeral(productChangeDetail.price).value() - numeral(productDetail.price).value()
          : ''}`,
        hasBorder: false,
      },
    ];
    const memberPriceForm: FormRowProps[] = [
      {
        title: '会员价调整为',
        isInput: true,
        inputType: 'number',
        inputValue: `${productChangeDetail.memberPrice || ''}`,
        inputOnChange: this.onMemberPriceChange,
      },
      {
        title: '会员价差额',
        extraText: `${productChangeDetail.memberPrice !== undefined && String(productChangeDetail.memberPrice) !== '' 
          ? numeral(productChangeDetail.memberPrice).value() - numeral(productDetail.memberPrice).value() 
          : ''}`,
        hasBorder: false,
      },
    ];

    const numberForm: FormRowProps[] = [
      {
        title: '库存调整为',
        isInput: true,
        inputType: 'number',
        inputValue: `${productChangeDetail.number || ''}`,
        inputOnChange: this.onNumberChange,
      },
      {
        title: '库存差额',
        extraText: `${productChangeDetail.number !== undefined && String(productChangeDetail.number) !== '' 
          ? numeral(productChangeDetail.number).value() - numeral(productDetail.number).value() 
          : ''}`,
        hasBorder: false,
      },
    ];

    const costButtons = generateModalButtons(
      () => this.changeModalVisible('costModalVisible', false),
      () => {
        this.onCostChange('');
        this.changeModalVisible('costModalVisible', false);
      }
    );
    const priceButtons = generateModalButtons(
      () => this.changeModalVisible('priceModalVisible', false), 
      () => {
        this.onPriceChange('');
        this.changeModalVisible('priceModalVisible', false)
      }
    );
    const memberPriceButtons = generateModalButtons(
      () => this.changeModalVisible('memberPriceModalVisible', false), 
      () => {
        this.onMemberPriceChange('');
        this.changeModalVisible('memberPriceModalVisible', false);
      }
    );
    const numberButtons = generateModalButtons(
      () => this.changeModalVisible('numberModalVisible', false), 
      () => {
        this.onNumberChange('');
        this.changeModalVisible('numberModalVisible', false);
      }
    );
    return (  
      <View>
        <Modal 
          isOpened={numberModalVisible}
          header="库存调整"
          onClose={() => this.changeModalVisible('numberModalVisible', false)}
          buttons={numberButtons}
        >
          <View className={`${cssPrefix}-detail-modal`}>
            <View className={`${cssPrefix}-detail-modal-text`}>系统库存: {productDetail.number}</View>
            <FormCard items={numberForm} />
          </View>
        </Modal>
        <Modal 
          isOpened={costModalVisible}
          header="进价调整"
          onClose={() => this.changeModalVisible('costModalVisible', false)}
          buttons={costButtons}
        >
          <View className={`${cssPrefix}-detail-modal`}>
            <View className={`${cssPrefix}-detail-modal-text`}>系统进价: {numeral(productDetail.cost).format('0.00')}</View>
            <FormCard items={costForm} />
          </View>
        </Modal>
        <Modal 
          isOpened={priceModalVisible}
          header="售价调整"
          onClose={() => this.changeModalVisible('priceModalVisible', false)}
          buttons={priceButtons}
        >
          <View className={`${cssPrefix}-detail-modal`}>
            <View className={`${cssPrefix}-detail-modal-text`}>系统售价: {numeral(productDetail.price).format('0.00')}</View>
            <FormCard items={priceForm} />
          </View>
        </Modal>
        <Modal 
          isOpened={memberPriceModalVisible}
          header="会员价调整"
          onClose={() => this.changeModalVisible('memberPriceModalVisible', false)}
          buttons={memberPriceButtons}
        >
          <View className={`${cssPrefix}-detail-modal`}>
            <View className={`${cssPrefix}-detail-modal-text`}>系统会员价: {numeral(productDetail.memberPrice).format('0.00')}</View>
            <FormCard items={memberPriceForm} />
          </View>
        </Modal>
      </View>
    );
  }
}

const mapState = (state: AppReducer.AppState) => {
  const productType = getProductType(state);
  const productTypeSelector = productType.map((type) => {
    return type.name;
  });
  return {
    productDetail: getProductDetail(state),
    productType,
    productTypeSelector,
  };
};

export default connect(mapState)(ProductDetail);