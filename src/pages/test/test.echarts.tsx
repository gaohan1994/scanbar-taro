import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import "./style/test.main.less";
import Echarts from 'echarts12';
import { AtButton } from 'taro-ui';

var myColor = ['#eb2100', '#eb3600', '#d0570e', '#d0a00e', '#34da62', '#00e9db', '#00c0e9', '#0096f3', '#33CCFF', '#33FFCC'];
var categories = [
    '方便面1', 
    '方便面2', 
    '方便面3', 
    '方便面4', 
    '方便面5', 
    '方便面6', 
    '方便面7', 
    '方便面8', 
    '方便面9', 
    '方便面10'
];
var data = [6647, 7473, 8190, 8488, 9491, 11726, 12745, 13170, 21319, 24934];

const option = {
    backgroundColor: '#fff',
    grid: {
        left: '25%',
        top: '12%',
        right: '25%',
        bottom: '8%',
        containLabel: true
    },
    xAxis: [{
        show: false,
    }],
    yAxis: [{
        axisTick: 'none',
        axisLine: 'none',
        offset: '27',
        axisLabel: {
            textStyle: {
                color: '#000',
                fontSize: '16',
            }
        },
        data: categories
    }, {
        name: '畅销商品TOP 10',
        nameGap: '10',
        nameTextStyle: {
            color: '#000',
            fontSize: '20',
        },
        axisLine: {
            lineStyle: {
                color: 'rgba(0,0,0,0)'
            }
        },
        data: [],
    }],
    series: [{
            type: 'bar',
            yAxisIndex: 0,
            data: data,
            label: {
                normal: {
                    show: true,
                    position: 'right',
                    textStyle: {
                        color: '#000',
                        fontSize: '16',
                    }
                }
            },
            barWidth: 12,
            itemStyle: {
                normal: {
                    barBorderRadius: 30,
                    color: function(params: any) {
                        var num = myColor.length;
                        return myColor[params.dataIndex % num];
                    },
                }
            },
        },
    ]
};
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
          option={option}
          // option={{
          //   title: {
          //     text: 'ECharts 入门示例'
          //   },
          //   legend: {
          //     data: ['销量']
          //   },
          //   xAxis: { data },
          //   yAxis: {},
          //   series: [{
          //     name: '销量',
          //     type: 'bar',
          //     data: [5, 20, 36, 10, 10, 20]
          //   }]
          // }}
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