import Taro from '@tarojs/taro';
import { View, Text, Image, Input } from '@tarojs/components';
import { AppReducer } from '../../reducers';
import { getProductCartList } from '../../common/sdk/product/product.sdk.reducer';
import { connect } from '@tarojs/redux';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import "../../component/card/form.card.less";
import './style/product.less';
import classnames from 'classnames';
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';
import invariant from 'invariant';
import { ResponseCode } from '../../constants/index';
import { store } from '../../app';
import { ProductInterfaceMap } from '../../constants';
import Modal from '../../component/modal/modal';
import numeral from 'numeral';

const cssPrefix = 'product';

interface Props {
  productCartList: ProductCartInterface.ProductCartInfo[];
}

interface State {
  eraseModal: boolean;
  eraseValue: string;
  memberModal: boolean;
  memberValue: string;
}

class ProductPay extends Taro.Component<Props, State> {

  state = {
    eraseModal: false,
    eraseValue: '',
    memberModal: false,
    memberValue: '',
  };
  
  public changeModalVisible = (key: string, visible?: boolean) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: typeof visible === 'boolean' ? visible : !prevState[key]
      };
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

  public getTransValue = (): number => {
    const { eraseValue } = this.state;
    productSdk.setErase(eraseValue);
    return productSdk.getProductTransPrice();
  }

  public onScanMember = () => {
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

  public onPayHandle = async () => {
    try {
      Taro.showLoading();
      const { eraseValue } = this.state;
      if (eraseValue !== '') {
        productSdk.setErase(eraseValue);
      }
      const payload = productSdk.getProductInterfacePayload();
      const result = await productSdk.cashierPay(payload);
      invariant(result.code === ResponseCode.success, result.msg || ResponseCode.error);
      Taro.hideLoading();
      store.dispatch({
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PAY_DETAIL,
        payload: { 
          payReceive: {
            ...result.data,
            transAmount: payload.order.transAmount
          }
        }
      });
      Taro.navigateTo({
        url: `/pages/pay/pay.receive`
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
    return (
      <View className='container'>
        <View className={`${cssPrefix}-pay-container ${cssPrefix}-pay`} >
          {/* <ScrollView 
            scrollY={true}
            className={`${cssPrefix}-pay-list`}
          > */}
            {this.renderListProductCard()}
            {this.renderListDetail()}
          {/* </ScrollView> */}
        </View>
        {this.renderFooter()}
        {this.renderEraseModal()}
        {this.renderMemberModal()}
      </View>
    );
  }

  private renderMemberModal = () => {
    const { memberModal, memberValue } = this.state;
    const buttons = [
      {
        title: '取消',
        type: 'cancel',
        onPress: () => {
          this.onChangeValue('eraseValue', '');
          this.changeModalVisible('eraseModal', false);
        },
      },
      {
        title: '确定',
        type: 'confirm',
        onPress: () => this.changeModalVisible('eraseModal', false)
      },
    ];
    return (
      <Modal
        isOpened={memberModal}
        buttons={buttons}
        header="选择会员"
      >
        <View className={`product-detail-modal`}>
          <View className={`product-detail-modal-text`}>优惠后金额: {productSdk.getProductPrice()}</View>
          <View 
            className={classnames('component-form', {
              'component-form-shadow': true
            })}
          >
            <View className={`${cssPrefix}-pay-member-input`}>
              <Input 
                className={`${cssPrefix}-pay-member-input-box`}
                placeholder="请输入卡号、手机号或姓名"
                value={memberValue}
                onInput={({detail: { value }}) => this.onChangeValue('memberValue', value)}
              />
              <View
                className={`${cssPrefix}-pay-member-input-icon`} 
                onClick={() => this.onScanMember()}
              >
                <Image 
                  src="//net.huanmusic.com/weapp/icon_close_scan.png"
                  className={`${cssPrefix}-pay-member-input-icon-img`} 
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  private renderEraseModal = () => {
    const { eraseModal, eraseValue } = this.state;
    const eraseButtons = [
      {
        title: '取消',
        type: 'cancel',
        onPress: () => {
          this.onChangeValue('eraseValue', '');
          this.changeModalVisible('eraseModal', false);
        },
      },
      {
        title: '确定',
        type: 'confirm',
        onPress: () => this.changeModalVisible('eraseModal', false)
      },
    ];
    const eraseForm: FormRowProps[] = [
      {
        title: '抹零金额（￥）',
        isInput: true,
        inputValue: eraseValue,
        inputType: 'number',
        inputOnChange: (value) => this.onChangeValue('eraseValue', value)
      },
      {
        title: '应收金额（￥）',
        extraText: `￥${numeral(productSdk.getProductPrice() - numeral(eraseValue).value()).format('0.00')}`,
        hasBorder: false
      },
    ];
    return (
      <Modal
        isOpened={eraseModal}
        buttons={eraseButtons}
        header="抹零"
      >
        <View className={`product-detail-modal`}>
          <View className={`product-detail-modal-text`}>优惠后金额: {productSdk.getProductPrice()}</View>
          <FormCard items={eraseForm} />
        </View>
      </Modal>
    );
  }

  private renderListProductCard = () => {
    const { productCartList } = this.props;
    return (
      <View 
        className={classnames('component-form', {
          'component-form-shadow': true
        })}
      >
        <View className={`${cssPrefix}-row ${cssPrefix}-row-border`}>
          <Text className={`${cssPrefix}-row-normal`}>商品详情</Text>
        </View>
        {
          productCartList.map((item, index) => {
            return (
              <View 
                key={item.id}
                className={classnames(`${cssPrefix}-row ${cssPrefix}-row-content`, {
                  [`${cssPrefix}-row-border`]: index !== (productCartList.length - 1)
                })}
              >
                <View className={`${cssPrefix}-row-content-item`}>
                  <Text className={`${cssPrefix}-row-name`}>{item.name}</Text>
                  <Text className={`${cssPrefix}-row-normal`}>{`x ${item.sellNum}`}</Text>
                </View>
                <View className={`${cssPrefix}-row-content-item ${cssPrefix}-row-content-top`}>
                  <Text className={`${cssPrefix}-row-normal`}>{`￥ ${item.price}`}</Text>
                  <Text className={`${cssPrefix}-row-normal`}>{`小计：￥ ${item.sellNum}`}</Text>
                </View>
              </View>
            );
          })
        }
      </View>
    );
  }

  private renderListDetail = () => {
    const formCard: FormRowProps[] = [
      {
        title: '商品数量',
        extraText: `${productSdk.getProductNumber()}`
      },
      {
        title: '原价金额',
        extraText: `￥${productSdk.getProductPrice()}`
      },
      // {
      //   title: '优惠金额',
      //   extraText: `$10`,
      //   extraTextStyle: 'price'
      // },
      {
        title: '应收金额',
        extraText: `￥${numeral(productSdk.getProductTransPrice()).format('0.00')}`,
        hasBorder: false
      },
    ];
    return (
      <FormCard items={formCard} />
    );
  }

  private renderFooter = () => {
    const { productCartList } = this.props;
    const { eraseValue } = this.state;
    return (
      <View className={`${cssPrefix}-pay-footer`}>
        <View className={`${cssPrefix}-pay-footer-bg`}>
          <View className={`${cssPrefix}-pay-footer-left`}>
            <View 
              className={`${cssPrefix}-pay-footer-left-item`}
              onClick={() => this.changeModalVisible('memberModal', true)}
            >
              <Image src='//net.huanmusic.com/weapp/icon_member.png' className={`${cssPrefix}-pay-footer-left-item-icon`} />
              <Text className={`${cssPrefix}-pay-footer-left-item-font`}>会员</Text>
            </View>
            <View 
              className={`${cssPrefix}-pay-footer-left-item`}
              onClick={() => this.changeModalVisible('eraseModal', true)}
            >
              <Image src='//net.huanmusic.com/weapp/icon_molin.png' className={`${cssPrefix}-pay-footer-left-item-icon`} />
              <Text className={`${cssPrefix}-pay-footer-left-item-font`}>{eraseValue === '' ? '抹零' : '已抹零'}</Text>
            </View>
          </View>
          <View
            className={classnames(`${cssPrefix}-pay-footer-right`, {
              [`${cssPrefix}-pay-footer-right-active`]: productCartList.length > 0,
              [`${cssPrefix}-pay-footer-right-disabled`]: productCartList.length === 0,
            })}
            onClick={() => this.onPayHandle()}
          >
            收款￥{numeral(this.getTransValue()).format('0.00')}
          </View>
        </View>
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  productCartList: getProductCartList(state),
});

export default connect(select)(ProductPay);