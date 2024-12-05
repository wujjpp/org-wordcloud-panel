/*
 * Created by Wu Jian Ping on - 2024/12/05.
 */

import 'echarts-wordcloud';

import { DataFrame, PanelProps } from '@grafana/data';
import { EventItem, ItemData, SimpleOptions } from 'types';

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

interface State {
  selectedBlocks: EventItem[];
}

export class WordCloudPanel extends React.Component<Props, State> {
  
  static GLOBAL_SELECTED_BLOCKS = [] as EventItem[]

  state = {
    selectedBlocks: [] as EventItem[]
  }

  callbacks = {
    "mouseover": (params: any )=> {
      if(WordCloudPanel.GLOBAL_SELECTED_BLOCKS.length === 0) {
          const blockTypeName = params.data?.blockTypeName
          const blockName = params.data?.blockName
          $(document).trigger("block-enter", {blocks: [{blockTypeName, blockName}]})
      }
    },

    "mouseout": (params: any) => {
      if(WordCloudPanel.GLOBAL_SELECTED_BLOCKS.length === 0) {
        const blockTypeName = params.data?.blockTypeName
        const blockName = params.data?.blockName
        $(document).trigger("block-leave", {blocks: [{blockTypeName, blockName}]})
      }
    },

    "click": (params: any) => {
      const blockTypeName = params.data?.blockTypeName
      const blockName = params.data?.blockName
      
      const obj = _.find(this.state.selectedBlocks, (o: EventItem) => o.blockTypeName === blockTypeName && o.blockName === blockName)
      
      if(obj) {
        this.setState({
          selectedBlocks: [..._.filter(this.state.selectedBlocks, o => o !== obj)]
        }, ()=>{
          WordCloudPanel.GLOBAL_SELECTED_BLOCKS = _.filter(WordCloudPanel.GLOBAL_SELECTED_BLOCKS, o => o.blockTypeName !== blockTypeName && o.blockName !== blockName)
          $(document).trigger("block-leave", {blocks: [{blockTypeName, blockName}]})
          $(document).trigger("block-enter", {blocks: WordCloudPanel.GLOBAL_SELECTED_BLOCKS})

        })
      } else {
        this.setState({
          selectedBlocks: [...this.state.selectedBlocks, {blockTypeName, blockName}]
        }, () => {
          WordCloudPanel.GLOBAL_SELECTED_BLOCKS.push({blockTypeName, blockName})
          $(document).trigger("block-enter", {blocks: WordCloudPanel.GLOBAL_SELECTED_BLOCKS})
        })
      }
    },
  }

  render() {
    const {data, id, fieldConfig, width, height} = this.props
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
              color: !!_.find(this.state.selectedBlocks, (obj: EventItem) => obj.blockTypeName === o.block_type_name && obj.blockName === o.block_name) ? colors.lightYellow : gradientColor((o.value - minValue) * 1.0 / (maxValue - minValue)).toString()
          },
          emphasis: {
              textStyle: {
                  color:  colors.lightYellow
              }
          }
      }
    })
  
    const option = {
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
          sizeRange: [12, 40],
          rotationRange: [-90, 90],
          rotationStep: 30,

          // shuffle: false,
          shrinkToFit: true,
          drawOutOfBound: false,
          layoutAnimation: true,
          
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
        onEvents={this.callbacks}
    />);
  }
}
