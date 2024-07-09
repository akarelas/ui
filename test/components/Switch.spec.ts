import { describe, it, expect, test } from 'vitest'
import Switch, { type SwitchProps, type SwitchSlots } from '../../src/runtime/components/Switch.vue'
import ComponentRender from '../component-render'
import theme from '#build/ui/switch'
import { flushPromises, mount } from '@vue/test-utils'
import { renderForm } from '../utils/form'
import type { FormInputEvents } from '~/src/module'

describe('Switch', () => {
  const sizes = Object.keys(theme.variants.size) as any

  it.each([
    // Props
    ['with as', { props: { as: 'section' } }],
    ['with defaultValue', { props: { defaultValue: true } }],
    ['with id', { props: { id: 'id' } }],
    ['with name', { props: { name: 'name' } }],
    ['with value', { props: { value: 'value' } }],
    ['with disabled', { props: { disabled: true } }],
    ['with checkedIcon', { props: { checkedIcon: 'i-heroicons-check-20-solid', defaultValue: true } }],
    ['with uncheckedIcon', { props: { uncheckedIcon: 'i-heroicons-x-mark-20-solid' } }],
    ['with loading', { props: { loading: true } }],
    ['with loadingIcon', { props: { loading: true, loadingIcon: 'i-heroicons-sparkles' } }],
    ['with label', { props: { label: 'Label' } }],
    ['with required', { props: { label: 'Label', required: true } }],
    ['with description', { props: { label: 'Label', description: 'Description' } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ['with color gray', { props: { color: 'gray', defaultValue: true } }],
    ['with class', { props: { class: 'inline-flex' } }],
    ['with ui', { props: { ui: { wrapper: 'ms-4' } } }],
    // Slots
    ['with label slot', { slots: { label: () => 'Label slot' } }],
    ['with description slot', { slots: { label: () => 'Description slot' } }]
  ])('renders %s correctly', async (nameOrHtml: string, options: { props?: SwitchProps, slots?: Partial<SwitchSlots> }) => {
    const html = await ComponentRender(nameOrHtml, options, Switch)
    expect(html).toMatchSnapshot()
  })

  describe('emits', () => {
    test('update:modelValue event', async () => {
      const wrapper = mount(Switch)
      const input = wrapper.findComponent({ name: 'SwitchRoot' })
      await input.vm.$emit('update:checked', true)
      expect(wrapper.emitted()).toMatchObject({ 'update:modelValue': [[true]] })
    })

    test('change event', async () => {
      const wrapper = mount(Switch)
      const input = wrapper.findComponent({ name: 'SwitchRoot' })
      await input.vm.$emit('update:checked', true)
      expect(wrapper.emitted()).toMatchObject({ change: [[{ type: 'change' }]] })
    })
  })

  describe('form integration', async () => {
    async function createForm(validateOn?: FormInputEvents[]) {
      const wrapper = await renderForm({
        props: {
          validateOn,
          validateOnInputDelay: 0,
          async validate(state: any) {
            if (!state.value)
              return [{ name: 'value', message: 'Error message' }]
            return []
          }
        },
        slotTemplate: `
        <UFormField name="value">
          <USwitch v-model="state.value" />
        </UFormField>
        `
      })
      const input = wrapper.findComponent({ name: 'SwitchRoot' })
      return {
        wrapper,
        input
      }
    }

    test('validate on change works', async () => {
      const { input, wrapper } = await createForm(['change'])
      await input.setValue(false)
      await input.vm.$emit('update:checked', false)
      await flushPromises()
      expect(wrapper.text()).toContain('Error message')

      await input.vm.$emit('update:checked', true)
      await flushPromises()
      expect(wrapper.text()).not.toContain('Error message')
    })

    test('validate on input works', async () => {
      const { input, wrapper } = await createForm(['input'])
      await input.vm.$emit('update:checked', false)
      await flushPromises()
      expect(wrapper.text()).toContain('Error message')

      await input.vm.$emit('update:checked', true)
      await flushPromises()
      expect(wrapper.text()).not.toContain('Error message')
    })
  })
})