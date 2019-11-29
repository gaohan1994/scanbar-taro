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
import { ResponseCode, MemberInterface, MemberInterfaceMap } from '../../constants/index';
import { store } from '../../app';
import { ProductInterfaceMap } from '../../constants';
import Modal from '../../component/modal/modal';
import numeral from 'numeral';
import memberService from '../../constants/member/member.service';
import { AtFloatLayout } from 'taro-ui';
import { Card } from '../../component/common/card/card.common';
import FormRow from '../../component/card/form.row';
import merge from 'lodash.merge';
import { PayReducer } from '../../reducers/app.pay';
import { getSelectMember } from '../../reducers/app.member';

const cssPrefix = 'product';

interface SelectMember extends MemberInterface.MemberInfo {
  perference?: MemberInterface.MemberPerference[];
  orderInfo?: MemberInterface.MemberOrderInfo;
}

interface Props {
  productCartList: ProductCartInterface.ProductCartInfo[];
  addSelectMember?: MemberInterface.MemberInfo;
}

interface State {
  eraseModal: boolean;
  eraseValue: string;
  memberModal: boolean;
  memberLayout: boolean;
  memberValue: string;
  selectMember?: SelectMember;
}

class ProductPay extends Taro.Component<Props, State> {

  readonly state: State = {
    eraseModal: false,
    eraseValue: '',
    memberModal: false,
    memberValue: '',
    memberLayout: false,
    selectMember: undefined,
  };

  public componentDidShow = () => {
    const { addSelectMember } = this.props; 
    /**
     * 每次进入结算页面的时候重置数据并清空 productsdk
     */
    this.setState({
      eraseModal: false,
      eraseValue: '',
      memberModal: false,
      memberValue: '',
      memberLayout: false,
    });
    productSdk.setErase(undefined);

    /**
     * @todo 如果是从添加会员页面回来则把新增的会员设置进去，如果是刚进入页面则重置会员状态
     */
    if (addSelectMember !== undefined) {
      this.setState({selectMember: addSelectMember});
      productSdk.setMember(addSelectMember);
      store.dispatch({
        type: MemberInterfaceMap.reducerInterfaces.SET_MEMBER_SELECT,
        payload: { selectMember: undefined }
      });
    } else {
      productSdk.setMember(undefined);
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
        Taro.showLoading();
        this.setState({
          memberValue: res.result
        });
        Taro.hideLoading();
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public changeMember = () => {
    this.changeModalVisible('memberLayout', false);
    this.changeModalVisible('memberModal', true);
  }

  public addMemberCallback = (member: SelectMember) => {
    console.log('member: ', member);
  }

  public onSearchMember = async () => {
    try {
      const { memberValue } = this.state;
      if (memberValue === '') {
        return;
      }
      Taro.showLoading();
      const result = await memberService.memberDetailByPreciseInfo({identity: memberValue});
      invariant(result.code === ResponseCode.success, result.msg || ResponseCode.error);

      if (result.data === undefined) {
        Taro.hideLoading();
        Taro.showModal({
          title: '提示',
          content: `没有找到会员${memberValue}，是否新增？`,
          success: ({confirm}) => {
            if (confirm) {
              const params = {
                phoneNumber: memberValue,
                needCallback: true,
              };
              // 用户点击了确定
              Taro.navigateTo({
                url: `/pages/member/member.add?params=${JSON.stringify(params)}`
              });
            }
          }
        });
        return;
      }

      /**
       * @param {selectMember} 选择的会员
       * 
       * @param {memberPerference} 会员的消费偏好
       * @param {memberOrderInfo} 会员的消费信息
       */
      let selectMember: SelectMember = merge({}, result.data);
      const memberPerference = await memberService.memberPreference({id: result.data.id});
      if (memberPerference.code === ResponseCode.success) {
        selectMember.perference = memberPerference.data;
      }
      
      const memberOrderInfo = await memberService.memberOrderInfo({id: result.data.id});
      if (memberOrderInfo.code === ResponseCode.success) {
        selectMember.orderInfo = memberOrderInfo.data;
      }
      
      Taro.hideLoading();
      productSdk.setMember(selectMember);
      this.setState({ 
        selectMember,
        memberModal: false,
      });
    } catch (error) {
      Taro.showLoading();
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
      this.changeModalVisible('memberModal', false);
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

      const payReceive: PayReducer.PayReceive = {
        transPayload: payload,
        transResult: result.data
      };
      console.log('payReceive: ', payReceive);
      store.dispatch({
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PAY_DETAIL,
        payload: { payReceive }
      });
      /**
       * @todo 调用支付接口成功后把抹零和会员都清除
       */
      productSdk.setErase(undefined);
      productSdk.setMember(undefined);
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
        {this.renderMemberLayout()}
      </View>
    );
  }

  private renderMemberLayout = () => {
    const { memberLayout, selectMember } = this.state;
    if (selectMember !== undefined) {
      const cssPrefix = 'member';
      const memberForm: FormRowProps[] = [{
        title: '上次消费时间',
        extraText: selectMember.orderInfo !== undefined ? selectMember.orderInfo.lastPayTime : '暂无消费记录'
      }];
      return (
        <AtFloatLayout
          isOpened={memberLayout}
          className={`product-pay-member-layout`}
          onClose={() => this.changeModalVisible('memberLayout', false)}
        >
          <View className={`product-pay-member-layout-container`}>
            <View 
              className={`product-detail-modal-close`}
              onClick={() => this.changeModalVisible('memberModal', false)}
            >
              <Image 
                className={`product-detail-modal-close-image`}
                src="//net.huanmusic.com/weapp/icon_del.png" 
              />
            </View>
            <View 
              className={`product-detail-modal-change`}
              onClick={() => this.changeMember()}
            >
              <View className={`product-detail-modal-change-text`}>更换会员</View>
            </View>
            <Card card-class="home-card member-card product-pay-member-layout-card">
              <View className={classnames(`${cssPrefix}-detail-img`)}>
                <Image className={`${cssPrefix}-detail-avator`} src="//net.huanmusic.com/weapp/icon_user.png" />
              </View>
              <View className={`${cssPrefix}-detail`}>
                <View className="title-text">{selectMember.username || ''}</View>
                <View className="small-text">{selectMember.phoneNumber || ''}</View>
              </View>
              <View className="home-buttons member-buttons">
                <View className="member-buttons-button home-buttons-button-border">
                  <View className="title-text">
                    {numeral(selectMember.orderInfo !== undefined && selectMember.orderInfo.totalAmount || 0).format('0.00')}
                  </View>
                  <View className="small-text">累计消费</View>
                </View>
                <View className="member-buttons-button">
                  <View className="title-text">
                    {numeral(selectMember.orderInfo !== undefined && selectMember.orderInfo.totalTimes || 0).value()}
                  </View>
                  <View className="small-text">购买次数</View>
                </View>
              </View>
            </Card>
            <Card card-class="home-card member-card">
              {memberForm.map((item) => {
                return <FormRow key={item.title} {...item} />;
              })}
              <View className={`product-pay-member-layout-card-row`}>
                <Text className={`product-pay-member-layout-card-row-text`}>消费偏好</Text>
                {selectMember.perference !== undefined ? (
                  <View className={`${cssPrefix}-detail-row-icons product-pay-member-layout-card-row-icons`}>
                    {
                      selectMember.perference.map((per) => {
                        return (
                          <View  
                            key={per.barcode}
                            className={`${cssPrefix}-detail-row-icon`}
                          >
                            {per.productName}
                          </View>
                        );
                      })
                    }
                  </View>
                ) : (
                  <Text className={`product-pay-member-layout-card-row-text`}>暂无消费偏好</Text>
                )}
              </View>
            </Card>
          </View>
        </AtFloatLayout>
      );
    }
    return (
      <View />
    );
  }

  private renderMemberModal = () => {
    const { memberModal, memberValue } = this.state;
    const buttons = [
      {
        title: '取消',
        type: 'cancel',
        onPress: () => {
          this.onChangeValue('memberModal', '');
          this.changeModalVisible('memberModal', false);
        },
      },
      {
        title: '确定',
        type: 'confirm',
        onPress: () => this.onSearchMember()
      },
    ];
    return (
      <Modal
        isOpened={memberModal}
        buttons={buttons}
        header="选择会员"
      >
        <View className={`product-detail-modal`}>
          <View 
            className={classnames('component-form', {
              'component-form-shadow': true
            })}
          >
            <View className={`${cssPrefix}-pay-member-input`}>
              <Input 
                className={`${cssPrefix}-pay-member-input-box`}
                placeholder="请输入卡号、手机号"
                value={memberValue}
                type="number"
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
        inputType: 'digit',
        inputOnChange: (value) => this.onChangeValue('eraseValue', value)
      },
      {
        title: '应收金额（￥）',
        extraText: `￥${numeral(productSdk.getProductMemberPrice() - numeral(eraseValue).value()).format('0.00')}`,
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
          <FormCard items={eraseForm} />
        </View>
      </Modal>
    );
  }

  private renderWeightProductDetail = (item: ProductCartInterface.ProductCartInfo) => {
    const { selectMember } = this.state;

    // 如果称重商品有改价 则优先计算改价，如果没有优先计算会员价
    const itemPrice: number = item.changePrice !== undefined
      ? numeral(item.changePrice).value()
      : selectMember !== undefined 
        ? item.memberPrice
        : item.price;
    return (
      <View className={`${cssPrefix}-row-content-item ${cssPrefix}-row-content-top`}>
        {item.changePrice !== undefined ? (
          <View className={`${cssPrefix}-row-content-items`}>
            <Text className={`${cssPrefix}-row-normal ${cssPrefix}-row-line`}>{`￥ ${numeral(item.price).format('0.00')}`}</Text>
            <View className={`${cssPrefix}-row-icon ${cssPrefix}-row-icon-member`}>改价</View>
            <Text className={`${cssPrefix}-row-normal`}>{`￥ ${numeral(item.changePrice).format('0.00')}`}</Text>
          </View>
        ) : selectMember !== undefined ? (
          <View className={`${cssPrefix}-row-content-items`}>
            <Text className={`${cssPrefix}-row-normal ${cssPrefix}-row-line`}>{`￥ ${item.price}`}</Text>
            <View className={`${cssPrefix}-row-icon ${cssPrefix}-row-icon-member`}>会员价</View>
            <Text className={`${cssPrefix}-row-normal`}>{`￥ ${item.memberPrice}`}</Text>
          </View>
        ) : (
          <Text className={`${cssPrefix}-row-normal`}>{`￥ ${item.price}`}</Text>
        )}
        <Text className={`${cssPrefix}-row-normal`}>
          {`小计：￥ ${itemPrice * item.sellNum}`}
        </Text>
      </View>
    );
  }

  private renderProductDetail = (item: ProductCartInterface.ProductCartInfo) => {
    const { selectMember } = this.state;
    return (
      <View className={`${cssPrefix}-row-content-item ${cssPrefix}-row-content-top`}>
        {selectMember !== undefined ? (
          <View className={`${cssPrefix}-row-content-items`}>
            <Text className={`${cssPrefix}-row-normal ${cssPrefix}-row-line`}>{`￥ ${item.price}`}</Text>
            <View className={`${cssPrefix}-row-icon ${cssPrefix}-row-icon-member`}>会员价</View>
            <Text className={`${cssPrefix}-row-normal`}>{`￥ ${item.memberPrice}`}</Text>
          </View>
        ) : (
          <Text className={`${cssPrefix}-row-normal`}>{`￥ ${item.price}`}</Text>
        )}
        <Text className={`${cssPrefix}-row-normal`}>
          {`小计：￥ ${selectMember !== undefined ? item.sellNum * item.memberPrice : item.sellNum * item.price}`}
        </Text>
      </View>
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
                {!productSdk.isWeighProduct(item) ? this.renderProductDetail(item) : this.renderWeightProductDetail(item)}
              </View>
            );
          })
        }
      </View>
    );
  }

  private renderListDetail = () => {
    const { selectMember, eraseValue } = this.state;
    const formCard: FormRowProps[] = [
      {
        title: '商品数量',
        extraText: `${productSdk.getProductNumber()}`
      },
      {
        title: '原价金额',
        extraText: `￥${numeral(productSdk.getProductPrice()).format('0.00')}`
      },
      {
        title: '优惠金额',
        extraText: `${selectMember !== undefined
          ? `- ￥${numeral(productSdk.getProductPrice() - productSdk.getProductMemberPrice()).format('0.00')}`
          : '￥0'}`,
        extraTextStyle: 'price'
      },
      {
        title: '抹零金额',
        extraText: `${eraseValue !== ''
          ? `- ￥${numeral(eraseValue).format('0.00')}`
          : '￥0'}`,
        extraTextStyle: 'price'
      },
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
    const { eraseValue, selectMember } = this.state;
    return (
      <View className={`${cssPrefix}-pay-footer`}>
        <View className={`${cssPrefix}-pay-footer-bg`}>
          <View className={`${cssPrefix}-pay-footer-left`}>
            <View 
              className={`${cssPrefix}-pay-footer-left-item`}
              onClick={() => {
                if (selectMember !== undefined) {
                  this.changeModalVisible('memberLayout', true);
                } else {
                  this.changeModalVisible('memberModal', true);
                }
              }}
            >
              <Image src='//net.huanmusic.com/weapp/icon_member.png' className={`${cssPrefix}-pay-footer-left-item-icon`} />
              <Text className={`${cssPrefix}-pay-footer-left-item-font`}>
                {`${selectMember && (selectMember as MemberInterface.MemberInfo).username || '会员'}`}
              </Text>
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
  addSelectMember: getSelectMember(state),
});

export default connect(select)(ProductPay as any);