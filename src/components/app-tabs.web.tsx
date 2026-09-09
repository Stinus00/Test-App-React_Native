import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '0%' }} />
      <TabList style={{ display: 'none' }}>
        <TabTrigger name="home" href="/" />
      </TabList>
    </Tabs>
  );
}
