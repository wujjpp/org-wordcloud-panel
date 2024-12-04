/*
 * Created by Wu Jian Ping on - 2024/12/04.
 */

import 'echarts-wordcloud';

import { DataFrame, PanelProps } from '@grafana/data';
import { ItemData, SimpleOptions } from 'types';

import { PanelDataErrorView } from '@grafana/runtime';
import React from 'react';
import ReactECharts from 'echarts-for-react';
import _ from 'lodash';
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

const dataFrameToTable = (dataFrame: DataFrame): ItemData[] => {
    // 将series转换成table
    const table: ItemData[] = []
    for(let i = 0; i < dataFrame.length; i++) {
      let obj: any = {}
      for(const field of dataFrame.fields) {
        obj[field.name] = field.values[i]
      }
      table.push(obj)
    }
  
    return table
  }
  
interface Props extends PanelProps<SimpleOptions> {}

const eventCallbacks = {
    "mouseover": (params: any )=> {
        const type = params.data?.type
        const name = params.data?.name

        $(document).trigger("block-enter", {type, name})
    },
    "mouseout": (params: any) => {
        const type = params.data?.type
        const name = params.data?.type
        $(document).trigger("block-leave", {type, name})
    }
}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  const items = dataFrameToTable(data.series[0])

  const minValue = _.minBy(items, o => o.value)?.value || 1
  const maxValue = _.maxBy(items, o => o.value)?.value || 1

  const d = _.map(items, o => {
    return {
        type: o.type,
        name: `${o.name}(${o.value})`,
        value: o.value,
        textStyle: {
            color: gradientColor((o.value - minValue) * 1.0 / (maxValue - minValue)).toString()
        },
        emphasis: {
            textStyle: {
                color:  colors.lightYellow
            }
        }
    }
  })

  let option = {
    tooltip: {
      show: false
    },
    backgroundColor: 'transparent',
    series: [ {
        type: 'wordCloud',
        shape: 'pentagon',
        
        left: 'center',
        top: 'center',
        width: '100%',
        height: '100%',
        right: null,
        bottom: null,

        gridSize: 8,
        sizeRange: [12, 50],
        rotationRange: [-90, 90],
        rotationStep: 30,
        shrinkToFit: true,
        
        drawOutOfBound: false,
        layoutAnimation: false,

        data: d
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
      onEvents={eventCallbacks}
      // opts={}
  />);
};
