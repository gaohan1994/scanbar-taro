/*
 * @Author: Ghan 
 * @Date: 2019-10-30 15:39:32 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-10-30 16:21:01
 */

import Taro from '@tarojs/taro';
import { View, Picker, } from '@tarojs/components';
import { AtListItem } from 'taro-ui';

type Props = { };

type State = { 
  date: string;
};

class TestDatePicker extends Taro.Component<Props, State> {
  state = {
    date: '2018-09-01'
  };

  public onDateChange = (event: any) => {
    this.setState({date: event.detail.value});
  }

  render () {
    return (
      <View>
        <Picker mode='date' onChange={this.onDateChange} value={this.state.date}>
          <AtListItem
            title="请选择日期"
            note={this.state.date}
          />
        </Picker>
      </View>
    );
  }
}

export default TestDatePicker;