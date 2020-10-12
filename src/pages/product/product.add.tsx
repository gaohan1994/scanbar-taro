/**
 * @Author: Ghan
 * @Date: 2019-11-20 13:37:23
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-06-10 15:41:20
 */
import Taro, { Config } from "@tarojs/taro";
import { View, Image, Picker, Text } from "@tarojs/components";
import { ProductAction } from "../../actions";
import { AtActionSheet, AtActionSheetItem, AtButton } from "taro-ui";
import invariant from "invariant";
import {
  ResponseCode,
  ProductInterface,
  ProductService,
  HTTPInterface,
  ProductInterfaceMap
} from "../../constants/index";
import "../style/product.less";
import { AppReducer } from "../../reducers";
import { getProductType, getProductSupplier } from "../../reducers/app.product";
import { connect } from "@tarojs/redux";
import { FormRowProps } from "../../component/card/form.row";
import FormCard from "../../component/card/form.card";
import classnames from "classnames";
import FormRow from "../../component/card/form.row";
import "../../component/card/form.card.less";
import Validator from "../../common/util/validator";
import getBaseUrl from "../../common/request/base.url";
import { LoginManager } from "../../common/sdk";
import { store } from "../../app";

const cssPrefix = "product";

interface Props {
  productType: ProductInterface.ProductType[];
  productTypeSelector: string[];
  productSupplier: ProductInterface.ProductSupplier[];
  productSupplierSelector: string[];
}

interface State {
  tempFilePaths: string[];
  cost: string; // 进价
  price: string; // 售价
  memberPrice: string; // 会员价
  typeValue: number; // 类别Id
  standard: string; // 规格
  unit: string; // 单位
  brand: string; // 品牌
  number: string; // 库存
  limitNum: string; // 库存下限预警
  saleType: number; // 销售类型（0：按件卖[默认]；1称重）
  status: number; // 商品状态(0：启用;1：停用)
  barcode: string; // 商品条码
  name: string; // 商品名称
  images: string[]; // 图片上传到服务器上之后的数组
  needCallback: boolean; // 新增完成之后是否需要数据回调
  supplier: string; // 供应商
  supplierValue: number; // 供应商pickerValue
  showMore: boolean; // 是否显示更多
  showSheet: boolean;
}

class ProductAdd extends Taro.Component<Props, State> {
  config: Config = {
    navigationBarTitleText: "新增商品"
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      barcode: "",
      name: "",
      tempFilePaths: [],
      cost: "",
      price: "",
      memberPrice: "",
      typeValue: -1,
      standard: "",
      unit: "",
      brand: "",
      number: "",
      limitNum: "",
      saleType: 0,
      status: 0,
      images: [],
      needCallback: false,
      supplier: "",
      supplierValue: 0,
      showMore: false,
      showSheet: false
    };
  }

  async componentWillMount() {
    try {
      /**
       * @todo 初始化typepicker的位置
       */
      const { productType, productSupplier } = this.props;
      if (productType.length === 0) {
        const typeResult = await ProductAction.productInfoType();
        invariant(
          typeResult.code === ResponseCode.success,
          typeResult.msg || ResponseCode.error
        );
      }
      
      const index = productType.findIndex((item) => item.name === '默认分类')
      this.setState({
        typeValue: index
      })
      
      if (productSupplier.length === 0) {
        const supplierResult = await ProductAction.productInfoSupplier();
        invariant(
          supplierResult.code === ResponseCode.success,
          supplierResult.msg || ResponseCode.error
        );
      }

      const { params } = this.$router.params;
      if (params !== undefined) {
        const { scanProduct: scan, needCallback } = JSON.parse(params);
        if (needCallback) {
          this.setState({ needCallback });
        }
        if (scan !== undefined) {
          Taro.showLoading();
          this.setState(
            {
              barcode: scan.barcode || "",
              name: scan.name,
              tempFilePaths: [scan.img],
              images: [scan.img],
              price: scan.price,
              standard: scan.standard,
              brand: scan.brand
            },
            () => {
              Taro.hideLoading();
            }
          );
        }
      }
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  }

  public onChangeShowMore = (show?: boolean) => {
    this.setState(prevState => {
      return {
        ...prevState,
        showMore: typeof show === "boolean" ? show : !prevState.showMore
      };
    });
  };

  public onScan = () => {
    try {
      /**
       * @todo [如果扫码出的商品已经存在本地商品库则提示商品已经存在了]
       * @todo [如果不存在则扫描商品条码后，自动获取并填写条码、名称、售价、规格、单位、品类、品牌、图片等信息，填充进之前没有写的部分]
       */
      Taro.scanCode().then(async barcode => {
        Taro.showLoading();
        const result = await ProductService.productInfoScanGet({
          barcode: barcode.result
        });
        if (result.code === ResponseCode.success) {
          // 如果扫码出的商品已经存在本地商品库则提示商品已经存在了
          Taro.hideLoading();
          Taro.showModal({
            title: "提示",
            content: "商品已经存在",
            showCancel: false
          });
          return;
        }

        if (result.code === "product.not.exist") {
          Taro.showModal({
            title: "提示",
            content: "请扫码正确的商品码",
            showCancel: false
          });
          return;
        }

        if ((barcode.result as string).startsWith("http")) {
          // 如果扫码出http说明不是商品码
          Taro.hideLoading();
          Taro.showModal({
            title: "提示",
            content: "请扫码正确的商品码",
            showCancel: false
          });
          return;
        }

        const thirdResult = await ProductService.productInfoScan({
          barcode: barcode.result
        });

        if (thirdResult.code === ResponseCode.success) {
          // 扫描商品条码后，自动获取并填写条码、名称、售价、规格、单位、品类、品牌、图片等信息，填充进之前没有写的部分
          const { data }: { data: ProductInterface.ProductScan } = thirdResult;
          this.setState(prevState => {
            return {
              ...prevState,
              barcode: barcode.result,
              name: prevState.name === "" ? data.name : prevState.name,
              tempFilePaths:
                prevState.tempFilePaths.length === 0
                  ? [data.img]
                  : prevState.tempFilePaths,
              images:
                prevState.tempFilePaths.length === 0
                  ? [data.img]
                  : prevState.tempFilePaths,
              price: prevState.price === "" ? data.price : prevState.price,
              standard:
                prevState.standard === "" ? data.standard : prevState.standard,
              brand: prevState.brand === "" ? data.brand : prevState.brand,
              supplier:
                prevState.supplier === "" ? data.supplier : prevState.supplier
            };
          });
          Taro.hideLoading();
          return;
        } else {
          Taro.showModal({
            title: "提示",
            content: "请扫码正确的商品码",
            showCancel: false
          });
          return;
        }
      });
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  public onChooseImages = (paths: string[]) => {
    const { result } = LoginManager.getUserToken();

    this.setState({
      tempFilePaths: paths
    });

    const that = this;

    Taro.uploadFile({
      url: `${getBaseUrl("")}/product/productInfo/upload`,
      filePath: paths[0],
      name: "files",
      header: { Authorization: result }
    })
      .then(res => {
        const data = JSON.parse(res.data);
        if (data.code === ResponseCode.success) {
          that.setState(prevState => {
            return {
              ...prevState,
              images: [data.data[0]]
            };
          });
        } else {
          throw new Error(data.msg || "上传图片失败");
        }
      })
      .catch(error => {
        Taro.showToast({
          title: error.message,
          icon: "none"
        });
      });
  };

  public onChangeValue = (key: string, value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: value
      };
    });
  };

  public onPictureImage = () => {
    try {
      // Taro
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  /**
   * @todo 选择图片组件
   *
   * @memberof ProductAdd
   */
  public onChoiceImage = (type: string = "album") => {
    try {
      Taro.chooseImage({
        sizeType: ["compressed"],
        sourceType: [type],
        count: 1
      }).then(res => {
        const { tempFilePaths } = res;
        this.onChooseImages(tempFilePaths);
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  public changeProductType = (event: any) => {
    const typeValue: number = event.detail.value;
    this.setState({ typeValue });
  };

  public changeProductSupplier = (event: any) => {
    const value: number = event.detail.value;
    this.setState({ supplierValue: value });
  };

  public getBarcode = async (): Promise<void> => {
    try {
      const result = await ProductService.productInfoGetBarcode();
      invariant(
        result.code === ResponseCode.success,
        result.msg || ResponseCode.error
      );
      this.setState({ barcode: result.data });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  public reset = () => {
    this.setState({
      barcode: "",
      name: "",
      tempFilePaths: [],
      cost: "",
      price: "",
      memberPrice: "",
      typeValue: -1,
      standard: "",
      unit: "",
      brand: "",
      number: "",
      limitNum: "",
      saleType: 0,
      status: 0
    });
  };

  public validate = (): { success: boolean; result: any } => {
    const helper = new Validator();
    const { barcode, name } = this.state;
    helper.add(barcode, [
      {
        strategy: "isNonEmpty",
        errorMsg: "请设置商品条码"
      }
    ]);
    helper.add(name, [
      {
        strategy: "isNonEmpty",
        errorMsg: "请输入商品名称"
      }
    ]);

    const result = helper.start();
    if (result) {
      return { success: false, result: result.msg };
    } else {
      return { success: true, result: "" };
    }
  };

  public addProduct = async (): Promise<
    HTTPInterface.ResponseResultBase<any>
  > => {
    return new Promise(async (resolve, reject) => {
      const { productType, productSupplier } = this.props;
      const {
        name,
        barcode,
        saleType,
        status,
        cost,
        price,
        memberPrice,
        typeValue,
        standard,
        unit,
        brand,
        number,
        limitNum,
        images,
        supplierValue
      } = this.state;
      let payload: ProductInterface.ProductInfoAdd = {
        barcode,
        name,
        saleType,
        status,
        type: typeValue !== -1 ? productType[typeValue].id : ("" as any),
        supplierId: productSupplier[supplierValue].id
      };

      if (!price) {
        Taro.showToast({
          title: "请设置售价",
          icon: "none"
        });
        return;
      }
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
      if (images && images.length > 0) {
        payload.imgs = images;
      }
      const addResult = await ProductService.productInfoAdd(payload);
      if (addResult.code === ResponseCode.success) {
        resolve(addResult);
      } else {
        reject({ message: addResult.msg });
      }
    });
  };

  /**
   * @todo 保存并新增
   * @todo 提示「新增成功」，并停留在当前页面，继续新增
   *
   * @memberof ProductAdd
   */
  public onSave = async () => {
    try {
      const { success, result } = this.validate();
      invariant(success, result || " ");

      const addResult = await this.addProduct();
      invariant(
        addResult.code === ResponseCode.success,
        addResult.msg || ResponseCode.error
      );

      Taro.showToast({
        title: "新增成功",
        icon: "success",
        duration: 500
      });
      setTimeout(() => {
        this.reset();
      }, 500);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };
  /**
   * @todo 保存
   *
   * @memberof ProductAdd
   */
  public onAdd = async () => {
    try {
      const { success, result } = this.validate();
      invariant(success, result || " ");

      const addResult = await this.addProduct();
      invariant(
        addResult.code === ResponseCode.success,
        addResult.msg || ResponseCode.error
      );
      const { needCallback } = this.state;
      if (needCallback) {
        store.dispatch({
          type: ProductInterfaceMap.reducerInterfaces.SET_SELECT_PRODUCT,
          payload: { selectProduct: addResult.data }
        });
      }
      Taro.showToast({
        title: "新增成功",
        icon: "success",
        duration: 500
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 500);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  render() {
    const { cost, price, barcode, name } = this.state;
    const formName: FormRowProps[] = [
      {
        title: "条码",
        main: true,
        extraThumb: "//net.huanmusic.com/weapp/icon_commodity_scan.png",
        extraThumbClick: this.onScan,
        buttons: [
          {
            title: barcode === "" ? "自动生成" : "重新生成",
            type: "confirm",
            onPress: () => this.getBarcode()
          }
        ],
        isInput: true,
        inputPlaceHolder: "输入或自动生成",
        inputValue: barcode,
        inputOnChange: value => this.onChangeValue("barcode", value)
      },
      {
        title: "名称",
        main: true,
        isInput: true,
        inputValue: name,
        inputOnChange: value => this.onChangeValue("name", value),
        inputPlaceHolder: "请输入商品名称",
        maxInput: true,
        hasBorder: false
      }
    ];
    const formPrice: FormRowProps[] = [
      {
        title: "售价(￥)",
        main: true,
        isInput: true,
        inputValue: price,
        inputType: "digit",
        inputPlaceHolder: "请输入售价",
        inputOnChange: value => this.onChangeValue("price", value)
      },
      {
        title: "进价(￥)",
        isInput: true,
        hasBorder: false,
        inputValue: cost,
        inputType: "digit",
        inputPlaceHolder: "请输入进价",
        inputOnChange: value => this.onChangeValue("cost", value)
      }
    ];
    return (
      <View className="container container-color">
        {this.renderImage()}
        <View
          className={`${cssPrefix}-detail-list product-add container-color`}
        >
          <FormCard items={formName} />
          <FormCard items={formPrice} />
          {this.renderMore()}
        </View>
        {this.renderButtons()}
        {this.renderActionSheet()}
      </View>
    );
  }

  private renderActionSheet = () => {
    const { showSheet } = this.state;
    return (
      <AtActionSheet
        isOpened={showSheet}
        cancelText="取消"
        onCancel={() => {
          this.setState({ showSheet: false });
        }}
        onClose={() => {
          this.setState({ showSheet: false });
        }}
      >
        <AtActionSheetItem
          onClick={() => {
            this.setState({ showSheet: false });
            this.onChoiceImage("camera");
          }}
        >
          拍照
        </AtActionSheetItem>
        <AtActionSheetItem
          onClick={() => {
            this.setState({ showSheet: false });
            this.onChoiceImage();
          }}
        >
          从相册中选择
        </AtActionSheetItem>
      </AtActionSheet>
    );
  };

  private renderMore = () => {
    const { showMore } = this.state;
    return (
      <View>
        <View
          onClick={() => this.onChangeShowMore()}
          className={`${cssPrefix}-add-more`}
        >
          更多信息
          {showMore ? (
            <Image
              src="//net.huanmusic.com/weapp/icon_packup_gray.png"
              className={`${cssPrefix}-add-more-image`}
            />
          ) : (
            <Image
              src="//net.huanmusic.com/weapp/icon_expand_gray.png"
              className={`${cssPrefix}-add-more-image`}
            />
          )}
        </View>
        {showMore && (
          <View>
            {this.renderMemberPrice()}
            {this.renderNumber()}
            {this.renderType()}
            {this.renderSupplier()}
            {this.renderStatus()}
          </View>
        )}
      </View>
    );
  };

  private renderMemberPrice = () => {
    const { memberPrice } = this.state;
    const memberForm: FormRowProps[] = [
      {
        title: "会员价(￥)",
        isInput: true,
        inputValue: memberPrice,
        inputType: "digit",
        inputPlaceHolder: "请输入会员价",
        inputOnChange: value => this.onChangeValue("memberPrice", value),
        hasBorder: false
      }
    ];
    return <FormCard items={memberForm} />;
  };

  private renderImage = () => {
    const { tempFilePaths } = this.state;
    return (
      <View
        className={`${cssPrefix}-detail-cover`}
        onClick={() => {
          this.setState({ showSheet: true });
        }}
      >
        {tempFilePaths && tempFilePaths[0] ? (
          <View
            className={`${cssPrefix}-detail-cover-image ${cssPrefix}-detail-cover-image-background`}
            style={`background-image: url(${tempFilePaths[0]})`}
          />
        ) : (
          <View className={`${cssPrefix}-detail-cover`}>
            <Image
              className={`${cssPrefix}-detail-cover-empty`}
              src="//net.huanmusic.com/weapp/empty.png"
            />
          </View>
        )}

        <View className={`${cssPrefix}-add-icon`} />
      </View>
    );
  };

  private renderType = () => {
    const { typeValue, unit, brand, standard } = this.state;
    const { productTypeSelector, productType } = this.props;
    const formDetail: FormRowProps[] = [
      {
        title: "规格",
        isInput: true,
        inputValue: standard,
        inputPlaceHolder: "如：50ml，100g",
        inputOnChange: value => this.onChangeValue("standard", value)
      },
      {
        title: "单位",
        isInput: true,
        inputValue: unit,
        inputPlaceHolder: "如：瓶，个，盒",
        inputOnChange: value => this.onChangeValue("unit", value)
      },
      {
        title: "品牌",
        isInput: true,
        inputValue: brand,
        inputPlaceHolder: "请输入品牌",
        inputOnChange: value => this.onChangeValue("brand", value),
        hasBorder: false
      }
    ];
    return (
      <View
        className={classnames("component-form", {
          "component-form-shadow": true
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
            extraText={
              (productType[typeValue] && productType[typeValue].name) || ""
            }
            arrow="right"
          />
        </Picker>
        {formDetail.map(item => {
          return <FormRow key={item.title} {...item} />;
        })}
      </View>
    );
  };

  private renderNumber = () => {
    const { number, limitNum } = this.state;
    const formNumber: FormRowProps[] = [
      {
        title: "初始库存",
        isInput: true,
        inputValue: `${number}`,
        inputPlaceHolder: "请输入库存",
        inputType: "number",
        inputOnChange: value => this.onChangeValue("number", value)
      },
      {
        title: "库存下限预警",
        isInput: true,
        inputValue: `${limitNum}`,
        inputPlaceHolder: "请输入库存预警",
        inputType: "number",
        inputOnChange: value => this.onChangeValue("limitNum", value),
        hasBorder: false
      }
    ];
    return <FormCard items={formNumber} />;
  };

  private renderSupplier = () => {
    const { supplierValue } = this.state;
    const { productSupplierSelector, productSupplier } = this.props;
    return (
      <View
        className={classnames("component-form", {
          "component-form-shadow": true
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
            extraText={
              (productSupplier[supplierValue] &&
                productSupplier[supplierValue].name) ||
              ""
            }
            arrow="right"
            hasBorder={false}
          />
        </Picker>
      </View>
    );
  };

  private renderStatus = () => {
    const { status, saleType } = this.state;
    const formStatus: FormRowProps[] = [
      {
        title: "商品销售类型",
        hasBorder: false,
        buttons: [
          {
            title: "按件售卖",
            type: saleType === 0 ? "confirm" : "cancel",
            onPress: () => this.setState({ saleType: 0 })
          },
          {
            title: "称重",
            type: saleType === 0 ? "cancel" : "confirm",
            onPress: () => this.setState({ saleType: 1 })
          }
        ]
      },
      {
        title: "商品状态",
        hasBorder: false,
        buttons: [
          {
            title: "启用",
            type: status === 0 ? "confirm" : "cancel",
            onPress: () => this.setState({ status: 0 })
          },
          {
            title: "停用",
            type: status === 0 ? "cancel" : "confirm",
            onPress: () => this.setState({ status: 1 })
          }
        ]
      }
    ];
    return <FormCard items={formStatus} />;
  };

  private renderButtons = () => {
    const { params } = this.$router.params;
    const token = !params;
    return (
      <View className={`${cssPrefix}-add-buttons`}>
        {token && (
          <View className={`${cssPrefix}-add-buttons-button`}>
            <AtButton className="theme-button" onClick={this.onSave}>
              <Text className="theme-button-text">保存并新增</Text>
            </AtButton>
          </View>
        )}
        <View
          className={classnames({
            [`${cssPrefix}-add-buttons-button`]: token,
            [`${cssPrefix}-add-buttons-one`]: !token
          })}
        >
          <AtButton className="theme-button" onClick={this.onAdd}>
            <Text className="theme-button-text">保存</Text>
          </AtButton>
        </View>
      </View>
    );
  };
}

const mapState = (state: AppReducer.AppState) => {
  const productType = getProductType(state);
  const productTypeSelector = productType.map(type => {
    return type.name;
  });

  const productSupplier = getProductSupplier(state);
  const productSupplierSelector = productSupplier.map(supplier => {
    return supplier.name;
  });
  return {
    productType,
    productTypeSelector,
    productSupplier,
    productSupplierSelector
  };
};

export default connect(mapState)(ProductAdd);
