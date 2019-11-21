/**
 * @Author: Ghan 
 * @Date: 2019-11-20 13:37:23 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-21 14:21:57
 */
import Taro from '@tarojs/taro';
import { View, Image, Picker } from '@tarojs/components';
import { ProductAction } from '../../actions';
import invariant from 'invariant';
import { ResponseCode, ProductInterface, ProductService, HTTPInterface } from '../../constants/index';
import './style/product.less';
import { AppReducer } from '../../reducers';
import { getProductType } from '../../reducers/app.product';
import { connect } from '@tarojs/redux';
import { FormRowProps } from '../../component/card/form.row';
import FormCard from '../../component/card/form.card';
import { AtButton, AtActivityIndicator } from 'taro-ui';
import merge from 'lodash/merge';
import classnames from 'classnames';
import FormRow from '../../component/card/form.row';
import "../../component/card/form.card.less";
import Validator from '../../common/util/validator';

const cssPrefix = 'product';

interface Props { 
  productType: ProductInterface.ProductType[];
  productTypeSelector: string[];
}

interface State { 
  tempFilePaths: string[];
  cost: string;         // 进价
  price: string;        // 售价
  memberPrice: string;  // 会员价
  typeValue: number;    // 类别Id
  standard: string;     // 规格
  unit: string;         // 单位
  brand: string;        // 品牌
  number: string;       // 库存
  limitNum: string;     // 库存下限预警
  saleType: number;     // 销售类型（0：按件卖[默认]；1称重）
  status: number;       // 商品状态(0：启用;1：停用)
  barcode: string;      // 商品条码
  name: string;         // 商品名称
}

class ProductAdd extends Taro.Component<Props, State> {
  constructor (props: Props) {
    super(props);
    this.state = {
      barcode: '',
      name: '',
      tempFilePaths: [],
      cost: '',
      price: '',
      memberPrice: '',
      typeValue: 0,
      standard: '',
      unit: '',
      brand: '',
      number: '',
      limitNum: '',
      saleType: 0,
      status: 0,
    };
  }

  componentDidShow = async () => {
    try {
      /**
       * @todo 初始化typepicker的位置
       */
      const typeResult = await ProductAction.productInfoType();  
      invariant(typeResult.code === ResponseCode.success, ResponseCode.error);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public onScan = () => {
    try {
      Taro
      .scanCode()
      .then(res => {
        console.log('res: ', res);
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public onChooseImages = (paths: string[]) => {
    this.setState({
      tempFilePaths: paths
    });
  }

  public onChangeValue = (key: string, value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: value
      };
    });
  }

  /**
   * @todo 选择图片组件
   *
   * @memberof ProductAdd
   */
  public onChoiceImage = () => {
    try {
      Taro
      .chooseImage({
        sourceType: ['album'],
        count: 1,
      })
      .then(res => {
        const { tempFilePaths } = res;
        this.onChooseImages(tempFilePaths);
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public changeProductType = (event: any) => {
    const typeValue: number = event.detail.value;
    this.setState({typeValue});
  }

  public getBarcode = async (): Promise<void> => {
    try {
      const result = await ProductService.productInfoGetBarcode();  
      invariant(result.code === ResponseCode.success, result.msg || ResponseCode.error);
      this.setState({ barcode: result.data });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public reset = () => {
    this.setState({
      barcode: '',
      name: '',
      tempFilePaths: [],
      cost: '',
      price: '',
      memberPrice: '',
      typeValue: 0,
      standard: '',
      unit: '',
      brand: '',
      number: '',
      limitNum: '',
      saleType: 0,
      status: 0,
    });
  }

  public validate = (): { success: boolean, result: any } => {
    
    const helper = new Validator();
    const { barcode, name, price, cost, memberPrice, number } = this.state;
    helper.add(barcode, [{
      strategy: 'isNonEmpty',
      errorMsg: '请设置商品条码',
    }]);
    helper.add(name, [{
      strategy: 'isNonEmpty',
      errorMsg: '请输入商品名称'
    }]);
    helper.add(price, [{
      strategy: 'isNonEmpty',
      errorMsg: '请输入商品价格'
    }]);
    helper.add(cost, [{
      strategy: 'isNonEmpty',
      errorMsg: '请输入商品进价'
    }]);
    helper.add(memberPrice, [{
      strategy: 'isNonEmpty',
      errorMsg: '请输入商品会员价'
    }]);
    helper.add(number, [{
      strategy: 'isNonEmpty',
      errorMsg: '请输入商品库存'
    }]);

    const result = helper.start();
    if (result) {
      return { success: false, result: result.msg };
    } else {
      return { success: true, result: '' };
    }
  }

  public addProduct = async (): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return new Promise(async (resolve, reject) => {
      const { productType } = this.props;
      const { name, barcode, saleType, status, cost, price, memberPrice, typeValue, standard, unit, brand, number, limitNum, } = this.state;
      let payload: ProductInterface.ProductInfoAdd = { 
        barcode, 
        name, 
        saleType, 
        status,
        type: productType[typeValue].id,
      };

      if (!!cost) {
        payload.cost = Number(cost);
      }
      if (!!price) {
        payload.price = Number(price);
      }
      if (!!memberPrice) {
        payload.memberPrice = Number(memberPrice);
      }
      if (!!standard) {
        payload.standard = standard;
      }
      if (!!unit) {
        payload.unit = unit;
      }
      if (!!brand) {
        payload.brand = brand;
      }
      if (!!number) {
        payload.number = Number(number);
      }
      if (!!limitNum) {
        payload.limitNum = Number(limitNum);
      }
      const addResult = await ProductService.productInfoAdd(payload);
      if (addResult.code === ResponseCode.success) {
        resolve(addResult);
      } else {
        reject(addResult.msg);
      }
    });
  }

  /**
   * @todo 保存并新增
   * @todo 提示「新增成功」，并停留在当前页面，继续新增
   *
   * @memberof ProductAdd
   */
  public onSave = async () => {
    try {
      const { success, result } = this.validate();
      invariant(success, result || ' ');

      const addResult = await this.addProduct(); 
      invariant(addResult.code === ResponseCode.success, addResult.msg || ResponseCode.error);
      
      Taro.showToast({
        title: '新增成功',
        icon: 'success',
        duration: 500
      });
      setTimeout(() => {
        this.reset();
      }, 500);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }
  /**
   * @todo 保存
   *
   * @memberof ProductAdd
   */
  public onAdd = async () => {
    try {
      const { success, result } = this.validate();
      invariant(success, result || ' ');

      const addResult = await this.addProduct();
      invariant(addResult.code === ResponseCode.success, addResult.msg || ResponseCode.error);

      Taro.showToast({
        title: '新增成功',
        icon: 'success',
        duration: 500
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 500);
    } catch (error) {
      console.log('error: ', error);
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {
    const { cost, price, memberPrice, barcode, name } = this.state;
    const formName: FormRowProps[] = [
      {
        title: '条码',
        extraText: barcode,
        extraThumb: '//net.huanmusic.com/weapp/icon_commodity_scan.png',
        extraThumbClick: this.onScan,
        buttons: [
          {
            title: barcode === '' ? '自动生成' : '重新生成',
            type: 'confirm',
            onPress: () => this.getBarcode()
          }
        ],
      },
      {
        title: '名称',
        isInput: true,
        inputValue: name,
        inputOnChange: (value) => this.onChangeValue('name', value),
        inputPlaceHolder: '请输入商品名称',
        hasBorder: false
      }
    ];
    const formPrice: FormRowProps[] = [
      {
        title: '进价（￥）',
        isInput: true,
        inputValue: cost,
        inputPlaceHolder: '请输入进价',
        inputOnChange: (value) => this.onChangeValue('cost', value)
      },
      {
        title: '售价（￥）',
        isInput: true,
        inputValue: price,
        inputPlaceHolder: '请输入售价',
        inputOnChange: (value) => this.onChangeValue('price', value),
      },
      {
        title: '会员价（￥）',
        isInput: true,
        inputValue: memberPrice,
        inputPlaceHolder: '请输入会员价',
        inputOnChange: (value) => this.onChangeValue('memberPrice', value),
        hasBorder: false
      },
    ];
    return (
      <View className="container">
        {this.renderImage()}
        <View className={`${cssPrefix}-detail-list`}>
          <FormCard items={formName} />
          <FormCard items={formPrice} />
          {this.renderType()}
          {this.renderNumber()}
          {this.renderStatus()}
          {this.renderButtons()}
        </View>
      </View>
    );
  }

  private renderImage = () => {
    const { tempFilePaths } = this.state;
    return (
      <View 
        className={`${cssPrefix}-detail-cover`}
        onClick={() => this.onChoiceImage()}
      >
        {
          tempFilePaths && tempFilePaths[0] && (
            <Image src={tempFilePaths[0]} className={`${cssPrefix}-detail-cover-image`} />
          )
        }
      </View>
    );
  }

  private renderType = () => {
    const { typeValue, unit, brand, standard } = this.state;
    const { productTypeSelector, productType } = this.props;
    const formDetail: FormRowProps[] = [
      {
        title: '规格',
        isInput: true,
        inputValue: standard,
        inputPlaceHolder: '如：50ml，100g',
        inputOnChange: (value) => this.onChangeValue('standard', value)
      },
      {
        title: '单位',
        isInput: true,
        inputValue: unit,
        inputPlaceHolder: '如：瓶，个，盒',
        inputOnChange: (value) => this.onChangeValue('unit', value)
      },
      {
        title: '品牌',
        isInput: true,
        inputValue: brand,
        inputPlaceHolder: '请输入品牌',
        inputOnChange: (value) => this.onChangeValue('brand', value),
        hasBorder: false
      }
    ];
    return (
      <View 
        className={classnames('component-form', {
          'component-form-shadow': true
        })}
      >
        <Picker 
          mode="selector"
          range={productTypeSelector}
          onChange={this.changeProductType}
          value={typeValue}
        >
          <FormRow 
            title="类别"
            extraText={productType[typeValue] && productType[typeValue].name || ''}
            arrow="right"
          />
        </Picker>
        {
          formDetail.map((item) => {
            return <FormRow key={item.title} {...item} />;
          })
        }
      </View>
    );
  }

  private renderNumber = () => {
    const { number, limitNum } = this.state;
    const formNumber: FormRowProps[] = [
      {
        title: '初始库存',
        isInput: true,
        inputValue: `${number}`,
        inputPlaceHolder: '请输入库存',
        inputType: 'number',
        inputOnChange: (value) => this.onChangeValue('number', value)
      },
      {
        title: '库存下限预警',
        isInput: true,
        inputValue: `${limitNum}`,
        inputPlaceHolder: '请输入库存下限预警',
        inputType: 'number',
        inputOnChange: (value) => this.onChangeValue('limitNum', value),
        hasBorder: false,
      },
    ];
    return (
      <FormCard items={formNumber} />
    );
  }

  private renderStatus = () => {
    const { status, saleType } = this.state;
    const formStatus: FormRowProps[] = [
      {
        title: '商品销售类型',
        hasBorder: false,
        buttons: [
          {
            title: '按件售卖',
            type: saleType === 0 ? 'confirm' : 'cancel',
            onPress: () => this.setState({ saleType: 0 })
          },
          {
            title: '称重',
            type: saleType === 0 ? 'cancel' : 'confirm',
            onPress: () => this.setState({ saleType: 1 })
          }
        ]
      },
      {
        title: '商品状态',
        hasBorder: false,
        buttons: [
          {
            title: '启用',
            type: status === 0 ? 'confirm' : 'cancel',
            onPress: () => this.setState({ status: 0 })
          },
          {
            title: '停用',
            type: status === 0 ? 'cancel' : 'confirm',
            onPress: () => this.setState({ status: 1 })
          }
        ]
      },
    ];
    return (
      <FormCard items={formStatus} />
    );
  }

  private renderButtons = () => {
    return (
      <View className={`${cssPrefix}-add-buttons`}>
        <View className={`${cssPrefix}-add-buttons-button`}>
          <AtButton 
            className="theme-button "
            onClick={this.onSave}
          >
            保存并新增
          </AtButton>
        </View>
        <View className={`${cssPrefix}-add-buttons-button`}>
          <AtButton 
            className="theme-button "
            onClick={this.onAdd}
          >
            保存
          </AtButton>
        </View>
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
    productType,
    productTypeSelector,
  };
};

export default connect(mapState)(ProductAdd);