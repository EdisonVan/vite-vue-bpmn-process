import { computed, toRef } from 'vue'
import { ModuleDeclaration } from 'didi'

import EventEmitter from '@/utils/EventEmitter'

// ** 官方流程模拟 module
// ** import simulationModeler from 'bpmn-js-token-simulation'

// camunda 官方侧边栏扩展
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel'
import CamundaExtensionModule from 'camunda-bpmn-moddle/lib'

// moddle 定义文件
import activitiModdleDescriptors from '@/components/ModdleExtensions/activiti.json'
import camundaModdleDescriptors from '@/components/ModdleExtensions/camunda.json'
import flowableModdleDescriptors from '@/components/ModdleExtensions/flowable.json'

// 自定义 modules 扩展模块
import translate from '@/components/AddiModules/Translate'
import EnhancementPalette from '@/components/AddiModules/Palette/EnhancementPalette'
import RewritePalette from '@/components/AddiModules/Palette/RewritePalette'
import EnhancementContextPad from '@/components/AddiModules/ContextPad/EnhancementContextPad'
import RewriteContextPad from '@/components/AddiModules/ContextPad/RewriteContextPad'
import renderer from '@/components/AddiModules/Renderer'

export default function (settings) {
  return computed<[ModuleDeclaration[], { [key: string]: any }]>(() => {
    const modules: ModuleDeclaration[] = [] // modules 扩展模块数组
    let moddle: { [key: string]: any } = {} // moddle 声明文件对象

    // 设置对应的 moddle 解析配置文件
    if (settings.value.processEngine === 'activiti') moddle['activiti'] = activitiModdleDescriptors
    if (settings.value.processEngine === 'camunda') moddle['camunda'] = camundaModdleDescriptors
    if (settings.value.processEngine === 'flowable') moddle['flowable'] = flowableModdleDescriptors

    // 配置 palette (可覆盖 paletteProvider 取消原生侧边栏)
    settings.value.paletteMode === 'enhancement' && modules.push(EnhancementPalette)
    settings.value.paletteMode === 'rewrite' && modules.push(RewritePalette)
    settings.value.paletteMode === 'custom' &&
      modules.push({ paletteProvider: ['type', function () {}] })

    // 配置 contextPad (可覆盖 contextPadProvider 取消原生上下文菜单)
    settings.value.contextPadMode === 'enhancement' && modules.push(EnhancementContextPad)
    settings.value.contextPadMode === 'rewrite' && modules.push(RewriteContextPad)

    // 配置 penal (基于 camunda)
    settings.value.penalMode !== 'custom' &&
      modules.push(
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        CamundaPlatformPropertiesProviderModule,
        CamundaExtensionModule
      ) &&
      (moddle = { camunda: camundaModdleDescriptors }) &&
      EventEmitter.instance.emit('settings', 'processEngine', 'camunda')

    console.log(settings.value)

    // 配置 翻译 与 流程模拟
    modules.push(translate)

    modules.push(renderer)

    // modules.push(simulationModeler)

    return [modules, moddle]
  })
}