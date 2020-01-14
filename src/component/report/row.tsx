/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-10 15:05:53
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "../../pages/style/report.less";
import "../card/form.card.less";
import classnames from 'classnames';

type ReportRowProps = {
  row: any;
  last?: boolean;
};
const cssPrefix = 'report';

class ReportRow extends Taro.Component<ReportRowProps> {

  static defaultProps = {
    row: {},
  };
  
  static options: Taro.ComponentOptions = {
    addGlobalClass: true
  };

  render () {
    const { row, last } = this.props;
    return (
      <View 
        className={classnames(`${cssPrefix}-row`, {
          [`${cssPrefix}-row-border`]: !last,
          [`${row.className}`]: row.className
        })}
        onClick={row && row.onClick ? row.onClick : () => {/** */}}
      >
        {row.arrow && (
          <View className={`${cssPrefix}-row-arrow`} />
        )}
        <Image
          src={row.icon}
          className={`${cssPrefix}-row-icon`}
        />
        {row.items.map((item) => {
          return (
            <View 
              key={item.title} 
              className={classnames(`${cssPrefix}-row-item`, {
                [`${item.className}`]: item.className
              })}
            >
              <Text 
                className={classnames(`${cssPrefix}-row-item-text`, {
                  [`${item.titleClassName}`]: item.titleClassName
                })}
              >
                {item.title}
              </Text>
              {item.value && (
                <Text 
                  className={classnames(`${cssPrefix}-row-item-price`, {
                    [`${item.valueClassName}`]: item.valueClassName
                  })}
                >
                  {item.value}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  }
}
export default ReportRow;