import Taro from '@tarojs/taro';
import { View, Image, Picker } from '@tarojs/components';
import { ProductAction } from '../../actions';
import invariant from 'invariant';
import { ResponseCode, ProductInterface, ProductService } from '../../constants/index';
import '../style/product.less';
import { AppReducer } from '../../reducers';
import { getProductDetail, getProductType, getProductSupplier } from '../../reducers/app.product';
import { connect } from '@tarojs/redux';
import { FormRowProps } from '../../component/card/form.row';
import FormCard from '../../component/card/form.card';
import { AtButton, AtActivityIndicator } from 'taro-ui';
import merge from 'lodash.merge';
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
  productSupplier: ProductInterface.ProductSupplier[];
  productSupplierSelector: string[];
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
  numberLimitModalVisible: boolean;
  supplierValue: number;
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
        unit: '',
        firstLetter: '',
        name: '',
        updateBy: '',
        createBy: '',
        createTime: '',
        updateTime: '',
        imgs: [],
        supplierId: -1,
        supplierName: '',
      },
      productChangeDetail: {},
      typeModalVisible: true,
      typePickerValue: 0,
      supplierValue: 0,
      costModalVisible: false,
      priceModalVisible: false,
      memberPriceModalVisible: false,
      numberModalVisible: false,
      numberLimitModalVisible: false,
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

      // 把需要直接修改的内容先赋值
      let productChangeDetail: Partial<ProductInterface.ProductInfo> = {
        saleType: productDetail.saleType,
        status: productDetail.status,
        barcode: productDetail.barcode,
      };
      if (!!productDetail.name) {
        productChangeDetail.name = productDetail.name;
      }
      if (!!productDetail.standard) {
        productChangeDetail.standard = productDetail.standard;
      }
      if (!!productDetail.unit) {
        productChangeDetail.unit = productDetail.unit;
      }
      if (!!productDetail.brand) {
        productChangeDetail.brand =  productDetail.brand;
      }
      if (!!productDetail.supplierName) {
        productChangeDetail.supplierName = productDetail.supplierName;
      }
      this.setState({ 
        productDetail,
        productChangeDetail,
      });

      /**
       * @todo 初始化picker的位置
       */ 
      let { productType, productSupplier } = this.props;
      if (productType.length === 0) {
        const typeResult = await ProductAction.productInfoType();  
        invariant(typeResult.code === ResponseCode.success, ResponseCode.error);
        productType = typeResult.data;
      }
      
      if (productSupplier.length === 0) {
        const supplierResult = await ProductAction.productInfoSupplier();  
        invariant(supplierResult.code === ResponseCode.success, ResponseCode.error);
        productSupplier = supplierResult.data;
      }

      this.setState({
        typePickerValue: productType.findIndex(t => t.id === productDetail.typeId),
        supplierValue: productSupplier.findIndex(s => s.id === productDetail.supplierId),
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

  public changeProductSupplier = (event: any) => {
    const { productSupplier } = this.props;
    const supplierIndex: number = event.detail.value;
    const supplier = productSupplier[supplierIndex];

    if (!supplier) {
      Taro.showModal({
        title: '提示',
        content: '未找到指定的供应商，请联系客服'
      });
      return;
    }

    this.setState(prevState => {
      return {
        ...prevState,
        productChangeDetail: {
          ...prevState.productChangeDetail,
          supplierId: supplier.id,
          supplierName: supplier.name,
        }
      };
    });
  }

  public changeModalVisible = (key: string, visible?: boolean) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: typeof visible === 'boolean' ? visible : !prevState[key]
      };
    });
  }

  public onNumberValueChange = (key: string, value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        productChangeDetail: {
          ...prevState.productChangeDetail,
          [key]: numeral(value).value()
        }
      };
    });
  }

  public onValueChange = (key: string, value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        productChangeDetail: {
          ...prevState.productChangeDetail,
          [key]: value
        }
      };
    });
  }

  /**
   * @todo [先校验升腾商品库中是否存在该商品，如果存在则提示已经存在该商品]
   * @todo [如果不存在去第三方库中查询，查询到商品信息后显示信息，如果没查到提示没有找到该商品]
   * @memberof ProductDetail
   */
  public onScanHandle = async () => {
    Taro
    .scanCode()
    .then(async (scanResult) => {
      Taro.showLoading();
      const barcode = scanResult.result;
      const result = await ProductService.productInfoScanGet({barcode});
      if (result.code === ResponseCode.success) {
        // 在升腾库中找到了
        Taro.hideLoading();
        Taro.showModal({
          title: '提示',
          content: '该商品已经存在',
          showCancel: false,
        });
        return;
      }
      const thirdResult = await ProductService.productInfoScan({barcode});
      if (thirdResult.code === ResponseCode.success) {
        // 第三方库中找到了
        const scanProduct = thirdResult.data;
        const { productChangeDetail, productDetail } = this.state;
        const newProductChangeDetail: Partial<ProductInterface.ProductInfo> = merge({}, productChangeDetail);

        // 条码直接覆盖
        newProductChangeDetail.barcode = barcode;
        if (!productDetail.name && !!scanProduct.name) {
          // 原来的商品没有名称且扫码的商品有名称则把名称填上
          newProductChangeDetail.name = scanProduct.name;
        }
        if (!productDetail.price && !!scanProduct.price) {
          // 原来的商品没有价格且扫码的商品有价格则把价格填上
          newProductChangeDetail.price = scanProduct.price;
        }
        if (!productDetail.standard && !!scanProduct.standard) {
          // 原来的商品没有standard ~~
          newProductChangeDetail.standard = scanProduct.standard;
        }
        if (!productDetail.brand && !!scanProduct.brand) {
          // brand ~~
          newProductChangeDetail.brand = scanProduct.brand;
        }
        this.setState({productChangeDetail: newProductChangeDetail});
        Taro.hideLoading();
        return;
      }
      Taro.hideLoading();
      Taro.showModal({
        title: '提示',
        content: '没有找到该商品',
        showCancel: false,
      });
    })
    .catch(error => {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    });
  }

  public reGenerateCode = async () => {
    try {
      Taro.showLoading();
      const result = await ProductService.productInfoGetBarcode();  
      invariant(result.code === ResponseCode.success, result.msg || ResponseCode.error);
      Taro.hideLoading();
      this.setState(prevState => {
        return {
          ...prevState,
          productChangeDetail: {
            ...prevState.productChangeDetail,
            barcode: result.data
          }
        };
      });
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
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
          key === 'price' || 
          key === 'saleType' || 
          key === 'status'
        ) {
          if (Number(productChangeDetail[key]) !== Number(productDetail[key])) {
            payload[key] = numeral(productChangeDetail[key]).value();
          }
        } else if (payload[key] !== productChangeDetail[key]) {
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
        main: true,
        isInput: true,
        inputValue: productChangeDetail.barcode,
        inputOnChange: (value) => this.onValueChange('barcode', value),
        extraThumb: '//net.huanmusic.com/weapp/icon_commodity_scan.png',
        extraThumbClick: this.onScanHandle,
        buttons: [
          {
            title: '重新生成',
            type: 'confirm',
            onPress: () => this.reGenerateCode()
          }
        ],
      },
      {
        title: '名称',
        main: true,
        isInput: true,
        inputValue: productChangeDetail.name,
        inputOnChange: (value) => this.onValueChange('name', value),
        hasBorder: false
      }
    ];
    const formDetail: FormRowProps[] = [
      {
        title: '规格',
        isInput: true,
        inputValue: productChangeDetail.standard,
        inputOnChange: (value) => this.onValueChange('standard', value)
      },
      {
        title: '单位',
        isInput: true,
        inputValue: productChangeDetail.unit,
        inputOnChange: (value) => this.onValueChange('unit', value)
      },
      {
        title: '品牌',
        isInput: true,
        inputValue: productChangeDetail.brand,
        inputOnChange: (value) => this.onValueChange('brand', value),
        hasBorder: false
      },
    ];
    const formNumber: FormRowProps[] = [
      {
        title: '库存',
        extraText: `${numeral(productChangeDetail.number || productDetail.number).value()}`,
        onClick: () => this.changeModalVisible('numberModalVisible', true)
      },
      {
        title: '库存下限预警',
        extraText: `${numeral(productChangeDetail.limitNum || productDetail.limitNum).value()}`,
        onClick: () => this.changeModalVisible('numberLimitModalVisible', true),
        hasBorder: false,
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

    const formStatus: FormRowProps[] = [
      {
        title: '商品销售类型',
        hasBorder: false,
        buttons: [
          {
            title: '按件售卖',
            type: productChangeDetail.saleType === 0 ? 'confirm' : 'cancel',
            onPress: () => this.onNumberValueChange('saleType', '0')
          },
          {
            title: '称重',
            type: productChangeDetail.saleType === 0 ? 'cancel' : 'confirm',
            onPress: () => this.onNumberValueChange('saleType', '1')
          }
        ]
      },
      {
        title: '商品状态',
        hasBorder: false,
        buttons: [
          {
            title: '启用',
            type: productChangeDetail.status === 0 ? 'confirm' : 'cancel',
            onPress: () => this.onNumberValueChange('status', '0')
          },
          {
            title: '停用',
            type: productChangeDetail.status === 0 ? 'cancel' : 'confirm',
            onPress: () => this.onNumberValueChange('status', '1')
          }
        ]
      },
    ];
    
    if (productDetail.id !== -1) {
      return (
        <View className="container">
          <View className={`${cssPrefix}-detail-cover`}>
            <Image 
              // src={productDetail.pictures} 
              src="//net.huanmusic.com/weapp/img_nolist.png"
              className={`${cssPrefix}-detail-cover-image`} 
            />
          </View>
          <View className={`${cssPrefix}-detail-list`}>
            <FormCard items={formName} />
            <FormCard items={formPrice} />
            <FormCard items={formNumber} />
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
              {
                formDetail.map((item) => {
                  return <FormRow key={item.title} {...item} />;
                })
              }
            </View>
            {this.renderSupplier()}
            <FormCard items={formStatus} />
  
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

  private renderSupplier = () => {
    const { supplierValue, productChangeDetail } = this.state;
    const { productSupplierSelector, productSupplier } = this.props;

    return (
      <View 
        className={classnames('component-form', {
          'component-form-shadow': true
        })}
      >
        <Picker 
          mode="selector"
          range={productSupplierSelector}
          onChange={this.changeProductSupplier}
          value={supplierValue}
        >
          <FormRow 
            title="供应商"
            // extraText={productSupplier[supplierValue] && productSupplier[supplierValue].name || ''}
            extraText={productChangeDetail.supplierName}
            arrow="right"
            hasBorder={false}
          />
        </Picker>
      </View>
    );
  }

  private renderModals = () => {
    const { 
      costModalVisible, 
      priceModalVisible, 
      memberPriceModalVisible,
      numberModalVisible,
      numberLimitModalVisible,
      productDetail,
      productChangeDetail
    } = this.state;

    const costForm: FormRowProps[] = [
      {
        title: '进价调整为',
        isInput: true,
        inputType: 'digit',
        inputValue: `${productChangeDetail.cost || ''}`,
        inputOnChange: (value) => this.onNumberValueChange('cost', value),
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
        inputType: 'digit',
        inputValue: `${productChangeDetail.price || ''}`,
        inputOnChange: (value) => this.onNumberValueChange('price', value)
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
        inputType: 'digit',
        inputValue: `${productChangeDetail.memberPrice || ''}`,
        inputOnChange: (value) => this.onNumberValueChange('memberPrice', value),
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
        inputType: 'digit',
        inputValue: `${productChangeDetail.number || ''}`,
        inputOnChange: (value) => this.onNumberValueChange('number', value)
      },
      {
        title: '库存差额',
        extraText: `${productChangeDetail.number !== undefined && String(productChangeDetail.number) !== '' 
          ? numeral(productChangeDetail.number).value() - numeral(productDetail.number).value() 
          : ''}`,
      },
    ];

    const numberLimitForm: FormRowProps[] = [
      {
        title: '库存预警调整为',
        isInput: true,
        inputType: 'number',
        inputValue: `${productChangeDetail.limitNum || ''}`,
        inputOnChange: (value) => this.onNumberValueChange('limitNum', value),
      },
      {
        title: '库存预警差额',
        extraText: `${productChangeDetail.limitNum !== undefined && String(productChangeDetail.limitNum) !== '' 
          ? numeral(productChangeDetail.limitNum).value() - numeral(productDetail.limitNum).value() 
          : ''}`,
        hasBorder: false,
      },
    ];

    const costButtons = generateModalButtons(
      () => this.changeModalVisible('costModalVisible', false),
      () => {
        this.onNumberValueChange('cost', '');
        this.changeModalVisible('costModalVisible', false);
      }
    );
    const priceButtons = generateModalButtons(
      () => this.changeModalVisible('priceModalVisible', false), 
      () => {
        this.onNumberValueChange('price', '');
        this.changeModalVisible('priceModalVisible', false)
      }
    );
    const memberPriceButtons = generateModalButtons(
      () => this.changeModalVisible('memberPriceModalVisible', false), 
      () => {
        this.onNumberValueChange('memberPrice', '');
        this.changeModalVisible('memberPriceModalVisible', false);
      }
    );
    const numberButtons = generateModalButtons(
      () => this.changeModalVisible('numberModalVisible', false), 
      () => {
        this.onNumberValueChange('number', '');
        this.changeModalVisible('numberModalVisible', false);
      }
    );
    const numberLimitButtons = generateModalButtons(
      () => this.changeModalVisible('numberLimitModalVisible', false), 
      () => this.changeModalVisible('numberLimitModalVisible', false),
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
          isOpened={numberLimitModalVisible}
          header="库存下限调整"
          onClose={() => this.changeModalVisible('numberModalVisible', false)}
          buttons={numberLimitButtons}
        >
          <View className={`${cssPrefix}-detail-modal`}>
            <View className={`${cssPrefix}-detail-modal-text`}>库存下限预警: {productDetail.limitNum}</View>
            <FormCard items={numberLimitForm} />
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

  const productSupplier = getProductSupplier(state);
  const productSupplierSelector = productSupplier.map((supplier) => {
    return supplier.name;
  });
  return {
    productDetail: getProductDetail(state),
    productType,
    productTypeSelector,
    productSupplier,
    productSupplierSelector,
  };
};

export default connect(mapState)(ProductDetail);