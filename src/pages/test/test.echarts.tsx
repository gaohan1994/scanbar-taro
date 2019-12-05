import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import "./style/test.main.less";
import Echarts from 'echarts12';
import { AtButton } from 'taro-ui';

interface State {
  data: string[];
}
class TestEcharts extends Taro.Component<any, State> {

  state = {
    data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
  };

  public changeData = () => {
    this.setState({data: ['111', '222', '333', '444'] });
  }

  render () {
    const { data } = this.state;
    return (
      <View className="container" >
        <Echarts
          style="height: 600px"
          option={{
            title: {
              text: 'ECharts 入门示例'
            },
            legend: {
              data: ['销量']
            },
            xAxis: { data },
            yAxis: {},
            series: [{
              name: '销量',
              type: 'bar',
              data: [5, 20, 36, 10, 10, 20]
            }]
          }}
        />

        <AtButton
          onClick={() => this.changeData()}
        >
          change
        </AtButton>
      </View>
    );
  }
}

export default TestEcharts;