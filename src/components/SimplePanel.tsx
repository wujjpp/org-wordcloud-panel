/*
 * Created by Wu Jian Ping on - 2024/12/04.
 */

import 'echarts-wordcloud';

import { PanelDataErrorView } from '@grafana/runtime';
import { PanelProps } from '@grafana/data';
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { SimpleOptions } from 'types';
import chroma from 'chroma-js';

const colors = {
  red : 'rgb(242, 73, 92)',
  green: 'rgb(115, 191, 105)',
  yellow : 'rgb(255, 152, 48)',
  white : '#fff',
  blue : 'rgb(110, 159, 255)',
  lightYellow: 'rgb(250, 222, 42)'
}

const gradientColor = chroma.scale([colors.green, colors.white, colors.red])

interface Props extends PanelProps<SimpleOptions> {}


export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }


  let option = {
    tooltip: {
      show: false
    },
    backgroundColor: 'transparent',
    series: [ {
        type: 'wordCloud',
        gridSize: 2,
        sizeRange: [12, 50],
        rotationRange: [-90, 90],
        shape: 'pentagon',
        width: 600,
        height: 400,
        drawOutOfBound: true,
        textStyle: {
            color: function () {
                return 'rgb(' + [
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160)
                ].join(',') + ')';
            }
        },
        emphasis: {
            textStyle: {
                shadowBlur: 10,
                shadowColor: '#333'
            }
        },
        data: [
            {
                name: 'Sam S Club',
                value: 10000,
                textStyle: {
                    color: 'black'
                },
                emphasis: {
                    textStyle: {
                        color: 'red'
                    }
                }
            },
            {
                name: 'Macys',
                value: 6181
            },
            {
                name: 'Amy Schumer',
                value: 4386
            },
            {
                name: 'Jurassic World',
                value: 4055
            },
            {
                name: 'Charter Communications',
                value: 2467
            },
            {
                name: 'Chick Fil A',
                value: 2244
            },
            {
                name: 'Planet Fitness',
                value: 1898
            },
            {
                name: 'Pitch Perfect',
                value: 1484
            },
            {
                name: 'Express',
                value: 1112
            },
            {
                name: 'Home',
                value: 965
            },
            {
                name: 'Johnny Depp',
                value: 847
            },
            {
                name: 'Lena Dunham',
                value: 582
            },
            {
                name: 'Lewis Hamilton',
                value: 555
            },
            {
                name: 'KXAN',
                value: 550
            },
            {
                name: 'Mary Ellen Mark',
                value: 462
            },
            {
                name: 'Farrah Abraham',
                value: 366
            },
            {
                name: 'Rita Ora',
                value: 360
            },
            {
                name: 'Serena Williams',
                value: 282
            },
            {
                name: 'NCAA baseball tournament',
                value: 273
            },
            {
                name: 'Point Break',
                value: 265
            }
        ]
    } ]
  };

  return (
    <ReactECharts
      option={option}
      notMerge={false}
      lazyUpdate={true}
      style={{height: `${height}px`, width: `${width}px`}}
      theme={"dark"}
      // onChartReady={this.onChartReadyCallback}
      // onEvents={EventsDict}
      // opts={}
  />);
};
