import Taro from '@tarojs/taro';
import { View, Input } from '@tarojs/components';
import '../../component/card/form.card.less';
import classnames from 'classnames';
import "../style/pay.less";
import productSdk from '../../common/sdk/product/product.sdk';
import numeral from 'numeral';
import invariant from 'invariant';
import { ResponseCode } from '../../constants/index';
import { store } from '../../app';
import { ProductInterfaceMap } from '../../constants';
import { PayReducer } from '../../reducers/app.pay';

const cssPrefix = 'pay';

interface Props { }
interface State { 
  inputValue: string;
}

class PayInput extends Taro.Component<Props, State> {
  state = {
    inputValue: ''
  };

  /**
   * @todo 刚进页面的时候清空输入值
   *
   * @memberof PayInput
   */
  public componentDidShow = () => {
    this.onChangeValue('');
  }

  public onChangeValue = (value: string) => {
    this.setState({ inputValue: value });
  }

  public onReceive = async () => {
    const { inputValue } = this.state;

    if (inputValue === '') {
      return;
    }
    try {
      Taro.showLoading();
      const payload = productSdk.getDirectProductInterfacePayload(numeral(inputValue).value());
      const result = await productSdk.cashierPay(payload);
      invariant(result.code === ResponseCode.success, result.msg || ResponseCode.error);
      Taro.hideLoading();
      const payReceive: PayReducer.PayReceive = {
        transPayload: payload,
        transResult: result.data
      };
      store.dispatch({
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PAY_DETAIL,
        payload: { payReceive }
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
    const { inputValue } = this.state;
    return (
      <View className={`container ${cssPrefix}-input`}>
        <View 
          className={classnames('component-form', {
            'component-form-shadow': true,
            [`${cssPrefix}-input-view`]: true
          })}
        >
          <View className={`${cssPrefix}-input-box`}>
            <View className={`${cssPrefix}-input-box-title`}>收款金额</View>
            <View className={`${cssPrefix}-input-box-input`}>
              <View className={`${cssPrefix}-input-box-input-money`}>￥</View>
              <Input 
                // cursorSpacing={300}
                className={`${cssPrefix}-input-box-input-input`} 
                value={inputValue}
                onInput={({detail: {value}}) => this.onChangeValue(value)}
                placeholder="请输入收款金额"
                placeholderClass={`${cssPrefix}-input-box-input-input-placeholder`}
                type='digit'
                focus={true}
              />
            </View>

            <View 
              className={classnames(`${cssPrefix}-input-box-button`, {
                [`${cssPrefix}-input-box-button-active`]: inputValue !== '',
                [`${cssPrefix}-input-box-button-disabled`]: inputValue === '',
              })}
              onClick={() => this.onReceive()}
            >
              确定
            </View>
          </View>
        </View>
      </View>
    );
  }
}
export default PayInput;