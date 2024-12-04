/*
 * Created by Wu Jian Ping on - 2024/12/04.
 */

import 'echarts-wordcloud';

import { DataFrame, PanelProps } from '@grafana/data';
import { ItemData, SimpleOptions } from 'types';
import React, { useEffect, useState } from 'react';

import { PanelDataErrorView } from '@grafana/runtime';
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



export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {

  const [selectedBlock, setSelectedBlock] = useState({
    blockTypeName:"",
    blockName:""
  })

  useEffect(()=>{
    
  })

  const eventCallbacks = {
    "mouseover": (params: any )=> {
      if(selectedBlock.blockName === "") {
          const blockTypeName = params.data?.blockTypeName
          const blockName = params.data?.blockName
          $(document).trigger("block-enter", {blockTypeName, blockName})
      }
    },

    "mouseout": (params: any) => {
      if(selectedBlock.blockName === "") {
        const blockTypeName = params.data?.blockTypeName
        const blockName = params.data?.blockName
        $(document).trigger("block-leave", {blockTypeName, blockName})
      }
    },

    "click": (params: any) => {
      const blockTypeName = params.data?.blockTypeName
      const blockName = params.data?.blockName

      if(selectedBlock.blockTypeName !== blockTypeName || selectedBlock.blockName !== blockName) {
        $(document).trigger("block-leave", {blockTypeName: selectedBlock.blockTypeName, blockName: selectedBlock.blockName})
        $(document).trigger("block-enter", {blockTypeName, blockName})

        setSelectedBlock({
          blockTypeName,
          blockName
        })

      } else {
        $(document).trigger("block-leave", {blockTypeName: selectedBlock.blockTypeName, blockName: selectedBlock.blockName})
        setSelectedBlock({
          blockTypeName: "",
          blockName: ""
        })
      }
    },
  }

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  const items = dataFrameToTable(data.series[0])

  const minValue = _.minBy(items, o => o.value)?.value || 1
  const maxValue = _.maxBy(items, o => o.value)?.value || 1

  const d = _.map(items, o => {
    return {
        blockTypeName: o.block_type_name,
        blockName: o.block_name,
        name: `${o.block_name}(${o.value})`,
        value: o.value,
        textStyle: {
            color: o.block_type_name === selectedBlock.blockTypeName && o.block_name === selectedBlock.blockName ? colors.lightYellow : gradientColor((o.value - minValue) * 1.0 / (maxValue - minValue)).toString()
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
        // rotationRange: [-90, 90],
        // rotationStep: 30,
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
      onEvents={eventCallbacks}
  />);
};
