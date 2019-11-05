/**
 * @Author: Ghan 
 * @Date: 2019-11-05 14:13:44 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-05 14:39:56
 * 
 * @todo [测试表格页面]
 */
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import "./style/test.main.less";
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';

interface Props { }
interface State { 
  form2Button1Type: boolean;
  form2Button2Type: boolean;
}

class TestForm extends Taro.Component<Props, State> {
  readonly state: State = {
    form2Button1Type: false,
    form2Button2Type: false,
  };

  public changeForm2Button = (key: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [`${key}`]: !prevState[key]
      };
    });
  }

  public onForm2Button1Click = () => {
    this.changeForm2Button('form2Button1Type');
  }

  public onForm2Button2Click = () => {
    this.changeForm2Button('form2Button1Type');
  }

  render () {
    const form1: FormRowProps[] = [
      {
        title: '类别',
        extraText: '饮料',
        arrow: 'right'
      },
      {
        title: '规格',
      },
      {
        title: '品牌',
        extraText: '未指定',
        arrow: 'right',
      },
      {
        title: '单位',
        extraText: '未指定',
        arrow: 'right',
        hasBorder: false
      }
    ];
    const form2: FormRowProps[] = [
      {
        title: '类别',
        buttons: [
          {
            title: '按件售卖',
            type: this.state.form2Button1Type === true ? 'confirm' : 'cancel',
            onPress: this.onForm2Button1Click
          },
          {
            title: '称重',
            type: this.state.form2Button1Type === true ? 'cancel' : 'confirm',
            onPress: this.onForm2Button2Click,
          }
        ]
      },
      {
        title: '商品状态',
        hasBorder: false,
        buttons: [
          {
            title: '启用',
            type: this.state.form2Button2Type === true ? 'confirm' : 'cancel',
            onPress: () => this.changeForm2Button('form2Button2Type')
          },
          {
            title: '停用',
            type: this.state.form2Button2Type === true ? 'cancel' : 'confirm',
            onPress: () => this.changeForm2Button('form2Button2Type')
          }
        ]
      },
    ];
    const form3: FormRowProps[] = [
      {
        title: '条码',
        extraText: '1234567894567',
        extraThumb: '//net.huanmusic.com/weapp/icon_commodity_scan.png',
        buttons: [
          {
            title: '按件售卖',
            type: 'confirm',
            onPress: () => {}
          }
        ],
      },
      {
        title: '名称',
        extraText: '可乐',
        hasBorder: false
      }
    ];
    return (
      <View className="test-form">
        <FormCard items={form1} />
        <FormCard items={form2} />
        <FormCard items={form3} />
      </View>
    );
  }
}

export default TestForm;