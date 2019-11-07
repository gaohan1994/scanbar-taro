import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "./style/pay.less";
import classnames from 'classnames';
import { AtActivityIndicator, AtButton } from 'taro-ui';
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';
import { arrayOf } from 'prop-types';

const Items = [
  {
    title: '收款码',
    image: '//net.huanmusic.com/weapp/cash.png',
    tab: 'receive',
  },
  {
    title: '收款码',
    image: '//net.huanmusic.com/weapp/cash.png',
    tab: 'scan',
  },
  {
    title: '现金',
    image: '//net.huanmusic.com/weapp/cash.png',
    tab: 'cash'
  },
];

const cssPrefix = 'pay';

interface Props { }
interface State { 
  tab: 'receive' | 'cash';
}

class PayReceive extends Taro.Component<Props, State> {
  readonly state: State = {
    tab: 'receive',
  };

  /**
   * @todo [修改当前页面tab]
   *
   * @memberof PayReceive
   */
  public onChangeTab = (tab: 'receive' | 'cash') => {
    this.setState({ tab });
  }

  /**
   * @todo [点击tab事件]
   *
   * @memberof PayReceive
   */
  public onTabClick = (tab: any) => {
    if (tab === 'scan') {
      Taro.showToast({ title: '调用扫一扫' });
    } else {
      this.onChangeTab(tab);
    }
  }

  /**
   * @todo [选择现金收款点击确定事件]
   *
   * @memberof PayReceive
   */
  public onCashReceive = () => {
    Taro.showToast({
      title: '现金收款',
      icon: 'success'
    });
  }

  render () {
    return (
      <View className={`container ${cssPrefix}-receive`}>
        <View className={`${cssPrefix}-receive-header`}>
          {
            Items.map((item) => {
              return (
                <View 
                  key={item.title} 
                  className={classnames(
                    `${cssPrefix}-receive-header-item`,
                    {
                      [`${cssPrefix}-receive-header-item-active`]: this.state.tab === item.tab
                    }
                  )} 
                  onClick={() => this.onTabClick(item.tab)}
                >
                  <Image src={item.image} className={`${cssPrefix}-receive-header-item-image`} />
                  <Text 
                    className={classnames(`${cssPrefix}-receive-header-item-text`)}
                  >
                    {item.title}
                  </Text>
                </View>
              );
            })
          }
        </View>
        {this.renderContent()}
      </View>
    );
  }

  /**
   * @todo [根据type渲染内容]
   *
   * @private
   * @memberof PayReceive
   */
  private renderContent = () => {
    const { tab } = this.state;

    if (tab === 'receive') {
      return (
        <View className={`${cssPrefix}-receive-content`}>
          <View className={`${cssPrefix}-receive-content-code`}>
            <AtActivityIndicator mode='center' />
          </View>
          <Text className={`${cssPrefix}-receive-content-text`}>请用手机扫一扫二维码，进行付款</Text>
          <View className={`${cssPrefix}-receive-content-price`}>￥26.50</View>
        </View>
      );
    } else if (tab === 'cash') {
      const cashForm: FormRowProps[] = [
        {
          title: '应收金额',
          extraText: '￥26.00'
        },
        {
          title: '找零金额',
          extraText: '￥26.00'
        },
        {
          title: '收款',
          extraText: '￥26.00'
        }
      ];
      return (
        <View className={`${cssPrefix}-receive-content-cash`}>
          <FormCard items={cashForm} shadow={false} />
          <View className={`${cssPrefix}-receive-content-cash-button`}>
            <AtButton 
              className="theme-pay-button"
              onClick={this.onCashReceive}
            >
              确定
            </AtButton>
          </View>
        </View>
      );
    }
  }
}

export default PayReceive;