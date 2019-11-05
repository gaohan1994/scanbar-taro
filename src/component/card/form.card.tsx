/*
 * @Author: Ghan 
 * @Date: 2019-11-05 10:33:07 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-05 14:09:36
 */
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import "./form.card.less";
import FormRow from './form.row';
import { FormRowProps } from './form.row';

interface Props {
  items: FormRowProps[];  // 传入表单列数据
}

class FormCard extends Taro.Component<Props> {
  render () {
    const { items = [] } = this.props;
    return (
      <View className="component-form">
        {
          items.map((item, index) => {
            return (
              <FormRow key={index} {...item} />
            );
          })
        }
      </View>
    );
  }
}

export default FormCard;