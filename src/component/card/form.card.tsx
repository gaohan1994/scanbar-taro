/*
 * @Author: Ghan
 * @Date: 2019-11-05 10:33:07
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-05-18 13:39:36
 */
import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import merge from "lodash.merge";
import "./form.card.less";
import FormRow from "./form.row";
import { FormRowProps } from "./form.row";
import classnames from "classnames";

interface Props {
  items: FormRowProps[]; // 传入表单列数据
  shadow: boolean; // 是否选择阴影
  margin?: boolean;
}

function mergeBorder(items): FormRowProps[] {
  const prevItems: FormRowProps[] = merge([], items);
  const nextItems: FormRowProps[] = prevItems.map((item, index) => {
    return {
      ...item,
      hasBorder: index !== prevItems.length - 1
    };
  });
  return nextItems;
}

class FormCard extends Taro.Component<Props> {
  static defaultProps = {
    shadow: true,
    items: []
  };

  render() {
    const { items = [], shadow, margin = true } = this.props;
    const rows = mergeBorder(items);
    return (
      <View
        className={classnames("component-form", {
          // 'component-form-shadow': shadow
        })}
        style={`${!margin ? "margin-top: 0px" : ""}`}
      >
        {rows.map((item, index) => {
          return <FormRow key={`${index}`} {...item} />;
        })}
        {this.props.children}
      </View>
    );
  }
}

export default FormCard;
