import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '0%' }} />
      <TabList style={{ display: 'none' }}>
        <TabTrigger name="home" href="/" />
        <TabTrigger name="testing" href="/testing" />
        <TabTrigger name="testing2" href="/testing2" />
        <TabTrigger name="testing3" href="/testing3" />
      </TabList>
    </Tabs>
  );
}
