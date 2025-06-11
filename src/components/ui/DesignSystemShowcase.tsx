import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Select, 
  Checkbox, 
  Switch, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  Alert,
  Badge,
  Tabs,
  Accordion,
  AccordionItem,
  Pagination,
  Avatar,
  Progress,
  Spinner,
  Tooltip,
  Modal,
  Dropdown
} from './DesignSystem';
import { Text, Heading } from './Typography';
import { Divider } from './Divider';
import { IconButton } from './IconButton';
import { Container } from '../layout/Container';
import { Grid } from '../layout/Grid';
import { Flex } from '../layout/Flex';
import { ColorModeToggle } from './ColorModeToggle';
import { 
  Settings, 
  Search, 
  Plus, 
  Trash, 
  Edit, 
  ChevronDown, 
  Bell, 
  User, 
  LogOut,
  Sun,
  Moon,
  Palette,
  Type,
  Layers,
  Grid as GridIcon,
  List,
  LayoutGrid
} from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  
  return (
    <Container maxWidth="xl" className="py-8">
      <Flex justify="between" items="center" className="mb-8">
        <Heading level={1}>Design System</Heading>
        <ColorModeToggle />
      </Flex>
      
      <Tabs
        tabs={[
          { label: 'Colors', icon: <Palette className="w-4 h-4" /> },
          { label: 'Typography', icon: <Type className="w-4 h-4" /> },
          { label: 'Components', icon: <Layers className="w-4 h-4" /> },
          { label: 'Layout', icon: <LayoutGrid className="w-4 h-4" /> }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-8"
      />
      
      {activeTab === 0 && (
        <section>
          <Heading level={2} className="mb-6">Color System</Heading>
          
          <Card className="mb-8">
            <CardBody>
              <Text variant="h3" className="mb-4">Primary Colors</Text>
              <div className="grid grid-cols-10 gap-2 mb-6">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade} className="text-center">
                    <div 
                      className="h-12 rounded-md mb-1"
                      style={{ backgroundColor: `var(--color-primary-${shade})` }}
                    ></div>
                    <Text variant="caption">{shade}</Text>
                  </div>
                ))}
              </div>
              
              <Text variant="h3" className="mb-4">Neutral Colors</Text>
              <div className="grid grid-cols-10 gap-2 mb-6">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade} className="text-center">
                    <div 
                      className="h-12 rounded-md mb-1"
                      style={{ backgroundColor: `var(--color-neutral-${shade})` }}
                    ></div>
                    <Text variant="caption">{shade}</Text>
                  </div>
                ))}
              </div>
              
              <Text variant="h3" className="mb-4">Semantic Colors</Text>
              <Grid cols={{ sm: 1, md: 2, lg: 4 }} gap={4}>
                <div>
                  <Text variant="body-sm" className="mb-2 font-medium">Success</Text>
                  <div className="space-y-2">
                    {[50, 100, 500, 600, 700].map(shade => (
                      <div key={shade} className="flex items-center">
                        <div 
                          className="w-12 h-6 rounded-md mr-2"
                          style={{ backgroundColor: `var(--color-success-${shade})` }}
                        ></div>
                        <Text variant="caption">{shade}</Text>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Text variant="body-sm" className="mb-2 font-medium">Warning</Text>
                  <div className="space-y-2">
                    {[50, 100, 500, 600, 700].map(shade => (
                      <div key={shade} className="flex items-center">
                        <div 
                          className="w-12 h-6 rounded-md mr-2"
                          style={{ backgroundColor: `var(--color-warning-${shade})` }}
                        ></div>
                        <Text variant="caption">{shade}</Text>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Text variant="body-sm" className="mb-2 font-medium">Error</Text>
                  <div className="space-y-2">
                    {[50, 100, 500, 600, 700].map(shade => (
                      <div key={shade} className="flex items-center">
                        <div 
                          className="w-12 h-6 rounded-md mr-2"
                          style={{ backgroundColor: `var(--color-error-${shade})` }}
                        ></div>
                        <Text variant="caption">{shade}</Text>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Text variant="body-sm" className="mb-2 font-medium">Info</Text>
                  <div className="space-y-2">
                    {[50, 100, 500, 600, 700].map(shade => (
                      <div key={shade} className="flex items-center">
                        <div 
                          className="w-12 h-6 rounded-md mr-2"
                          style={{ backgroundColor: `var(--color-info-${shade})` }}
                        ></div>
                        <Text variant="caption">{shade}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              </Grid>
            </CardBody>
          </Card>
        </section>
      )}
      
      {activeTab === 1 && (
        <section>
          <Heading level={2} className="mb-6">Typography</Heading>
          
          <Card className="mb-8">
            <CardBody>
              <div className="space-y-6">
                <div>
                  <Heading level={1}>Heading 1</Heading>
                  <Text variant="body-sm" color="muted">font-size: var(--font-size-4xl)</Text>
                </div>
                <div>
                  <Heading level={2}>Heading 2</Heading>
                  <Text variant="body-sm" color="muted">font-size: var(--font-size-3xl)</Text>
                </div>
                <div>
                  <Heading level={3}>Heading 3</Heading>
                  <Text variant="body-sm" color="muted">font-size: var(--font-size-2xl)</Text>
                </div>
                <div>
                  <Heading level={4}>Heading 4</Heading>
                  <Text variant="body-sm" color="muted">font-size: var(--font-size-xl)</Text>
                </div>
                <div>
                  <Heading level={5}>Heading 5</Heading>
                  <Text variant="body-sm" color="muted">font-size: var(--font-size-lg)</Text>
                </div>
                <div>
                  <Heading level={6}>Heading 6</Heading>
                  <Text variant="body-sm" color="muted">font-size: var(--font-size-base)</Text>
                </div>
                
                <Divider />
                
                <div>
                  <Text variant="body">Body Text</Text>
                  <Text variant="body-sm" color="muted">font-size: var(--font-size-base)</Text>
                </div>
                <div>
                  <Text variant="body-sm">Small Text</Text>
                  <Text variant="body-sm" color="muted">font-size: var(--font-size-sm)</Text>
                </div>
                <div>
                  <Text variant="body-xs">Extra Small Text</Text>
                  <Text variant="body-sm" color="muted">font-size: var(--font-size-xs)</Text>
                </div>
                <div>
                  <Text variant="caption">Caption Text</Text>
                  <Text variant="body-sm" color="muted">font-size: var(--font-size-xs)</Text>
                </div>
                <div>
                  <Text variant="overline">OVERLINE TEXT</Text>
                  <Text variant="body-sm" color="muted">font-size: var(--font-size-xs), uppercase, tracking-wider</Text>
                </div>
                
                <Divider />
                
                <div>
                  <Text weight="normal">Normal weight text</Text>
                  <Text variant="body-sm" color="muted">font-weight: var(--font-weight-normal)</Text>
                </div>
                <div>
                  <Text weight="medium">Medium weight text</Text>
                  <Text variant="body-sm" color="muted">font-weight: var(--font-weight-medium)</Text>
                </div>
                <div>
                  <Text weight="semibold">Semibold weight text</Text>
                  <Text variant="body-sm" color="muted">font-weight: var(--font-weight-semibold)</Text>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>
      )}
      
      {activeTab === 2 && (
        <section>
          <Heading level={2} className="mb-6">Components</Heading>
          
          <Grid cols={{ sm: 1, lg: 2 }} gap={8}>
            <div>
              <Card className="mb-8">
                <CardHeader title="Buttons" />
                <CardBody>
                  <Text variant="h4" className="mb-4">Button Variants</Text>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="info">Info</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="outline">Outline</Button>
                  </div>
                  
                  <Text variant="h4" className="mb-4">Button Sizes</Text>
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <Button size="xs">Extra Small</Button>
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                  
                  <Text variant="h4" className="mb-4">Button States</Text>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <Button leftIcon={<Plus className="w-4 h-4" />}>With Icon</Button>
                    <Button rightIcon={<ChevronDown className="w-4 h-4" />}>With Icon</Button>
                    <Button isLoading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    <Button fullWidth>Full Width</Button>
                  </div>
                  
                  <Text variant="h4" className="mb-4">Icon Buttons</Text>
                  <div className="flex flex-wrap gap-4">
                    <IconButton icon={<Settings />} variant="primary" label="Settings" />
                    <IconButton icon={<Edit />} variant="secondary" label="Edit" />
                    <IconButton icon={<Trash />} variant="danger" label="Delete" />
                    <IconButton icon={<Plus />} variant="ghost" label="Add" />
                    <IconButton icon={<Search />} variant="outline" label="Search" />
                  </div>
                </CardBody>
              </Card>
              
              <Card className="mb-8">
                <CardHeader title="Form Controls" />
                <CardBody>
                  <div className="space-y-6">
                    <div>
                      <Text variant="h4" className="mb-4">Text Inputs</Text>
                      <div className="space-y-4">
                        <Input 
                          label="Standard Input" 
                          placeholder="Enter text here" 
                          helperText="This is a helper text"
                        />
                        <Input 
                          label="With Error" 
                          placeholder="Enter text here" 
                          error="This field is required"
                        />
                        <Input 
                          label="With Icon" 
                          placeholder="Search..." 
                          leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
                        />
                        <Input 
                          label="Disabled Input" 
                          placeholder="This input is disabled" 
                          disabled
                        />
                      </div>
                    </div>
                    
                    <Divider />
                    
                    <div>
                      <Text variant="h4" className="mb-4">Select</Text>
                      <div className="space-y-4">
                        <Select 
                          label="Standard Select" 
                          options={[
                            { value: '', label: 'Select an option' },
                            { value: 'option1', label: 'Option 1' },
                            { value: 'option2', label: 'Option 2' },
                            { value: 'option3', label: 'Option 3' }
                          ]}
                        />
                        <Select 
                          label="With Error" 
                          options={[
                            { value: '', label: 'Select an option' },
                            { value: 'option1', label: 'Option 1' },
                            { value: 'option2', label: 'Option 2' }
                          ]}
                          error="Please select an option"
                        />
                        <Select 
                          label="Disabled Select" 
                          options={[
                            { value: '', label: 'Select an option' },
                            { value: 'option1', label: 'Option 1' },
                            { value: 'option2', label: 'Option 2' }
                          ]}
                          disabled
                        />
                      </div>
                    </div>
                    
                    <Divider />
                    
                    <div>
                      <Text variant="h4" className="mb-4">Checkbox & Switch</Text>
                      <div className="space-y-4">
                        <Checkbox label="Standard checkbox" />
                        <Checkbox label="Checked checkbox" checked />
                        <Checkbox label="Disabled checkbox" disabled />
                        <Checkbox 
                          label="With description" 
                          description="This is a more detailed description of the checkbox"
                        />
                        
                        <Switch 
                          label="Standard switch" 
                          checked={switchValue} 
                          onChange={() => setSwitchValue(!switchValue)}
                        />
                        <Switch 
                          label="Disabled switch" 
                          checked 
                          disabled
                        />
                        <Switch 
                          label="With description" 
                          description="This is a more detailed description of the switch"
                          checked={switchValue} 
                          onChange={() => setSwitchValue(!switchValue)}
                        />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
            
            <div>
              <Card className="mb-8">
                <CardHeader title="Feedback & Status" />
                <CardBody>
                  <Text variant="h4" className="mb-4">Alerts</Text>
                  <div className="space-y-4 mb-6">
                    <Alert variant="info">This is an informational alert.</Alert>
                    <Alert variant="success" title="Success">Operation completed successfully.</Alert>
                    <Alert variant="warning" title="Warning" onClose={() => {}}>
                      This action cannot be undone.
                    </Alert>
                    <Alert variant="error" title="Error">
                      An error occurred while processing your request.
                    </Alert>
                  </div>
                  
                  <Text variant="h4" className="mb-4">Badges</Text>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="error">Error</Badge>
                    <Badge variant="info">Info</Badge>
                  </div>
                  
                  <Text variant="h4" className="mb-4">Progress</Text>
                  <div className="space-y-4 mb-6">
                    <Progress value={25} label="25%" showValue />
                    <Progress value={50} color="success" label="Success" />
                    <Progress value={75} color="warning" label="Warning" />
                    <Progress value={90} color="error" label="Error" />
                  </div>
                  
                  <Text variant="h4" className="mb-4">Loading States</Text>
                  <div className="flex flex-wrap gap-4">
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                    <Spinner color="secondary" />
                  </div>
                </CardBody>
              </Card>
              
              <Card className="mb-8">
                <CardHeader title="Interactive Components" />
                <CardBody>
                  <Text variant="h4" className="mb-4">Tabs</Text>
                  <div className="space-y-6 mb-6">
                    <Tabs
                      tabs={[
                        { label: 'Tab 1' },
                        { label: 'Tab 2' },
                        { label: 'Tab 3' },
                        { label: 'Disabled', disabled: true }
                      ]}
                      activeTab={0}
                      onChange={() => {}}
                    />
                    
                    <Tabs
                      tabs={[
                        { label: 'Tab 1', icon: <Settings className="w-4 h-4" /> },
                        { label: 'Tab 2', icon: <User className="w-4 h-4" /> },
                        { label: 'Tab 3', icon: <Bell className="w-4 h-4" /> }
                      ]}
                      activeTab={0}
                      onChange={() => {}}
                      variant="pills"
                    />
                  </div>
                  
                  <Text variant="h4" className="mb-4">Accordion</Text>
                  <Accordion className="mb-6">
                    <AccordionItem title="Section 1" defaultOpen>
                      <Text variant="body-sm" color="muted">
                        Content for section 1. This section is expanded by default.
                      </Text>
                    </AccordionItem>
                    <AccordionItem title="Section 2">
                      <Text variant="body-sm" color="muted">
                        Content for section 2.
                      </Text>
                    </AccordionItem>
                    <AccordionItem title="Section 3" icon={<Settings className="w-4 h-4" />}>
                      <Text variant="body-sm" color="muted">
                        Content for section 3 with an icon.
                      </Text>
                    </AccordionItem>
                  </Accordion>
                  
                  <Text variant="h4" className="mb-4">Modal & Dropdown</Text>
                  <div className="flex flex-wrap gap-4">
                    <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                    <Modal
                      isOpen={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                      title="Modal Title"
                      footer={
                        <div className="flex justify-end space-x-2">
                          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                          <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
                        </div>
                      }
                    >
                      <Text variant="body" color="muted">
                        This is a modal dialog. You can put any content here.
                      </Text>
                    </Modal>
                    
                    <Dropdown
                      trigger={<Button rightIcon={<ChevronDown className="w-4 h-4" />}>Dropdown</Button>}
                      items={[
                        { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => {} },
                        { label: 'Duplicate', icon: <Copy className="w-4 h-4" />, onClick: () => {} },
                        { label: 'Disabled Item', icon: <Eye className="w-4 h-4" />, disabled: true },
                        { label: 'Delete', icon: <Trash className="w-4 h-4" />, onClick: () => {}, danger: true }
                      ]}
                    />
                  </div>
                </CardBody>
              </Card>
            </div>
          </Grid>
          
          <Card>
            <CardHeader title="Miscellaneous Components" />
            <CardBody>
              <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={6}>
                <div>
                  <Text variant="h4" className="mb-4">Avatars</Text>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <Avatar initials="JD" size="xs" />
                    <Avatar initials="JD" size="sm" />
                    <Avatar initials="JD" size="md" />
                    <Avatar initials="JD" size="lg" />
                    <Avatar initials="JD" size="xl" shape="square" />
                  </div>
                  
                  <Text variant="h4" className="mb-4">Tooltips</Text>
                  <div className="flex flex-wrap gap-4">
                    <Tooltip content="This is a tooltip">
                      <Button variant="secondary" size="sm">Hover me</Button>
                    </Tooltip>
                    <Tooltip content="Bottom tooltip" position="bottom">
                      <IconButton icon={<Info />} variant="outline" label="Info" />
                    </Tooltip>
                  </div>
                </div>
                
                <div>
                  <Text variant="h4" className="mb-4">Pagination</Text>
                  <Pagination
                    currentPage={3}
                    totalPages={10}
                    onPageChange={() => {}}
                    className="mb-6"
                  />
                  
                  <Text variant="h4" className="mb-4">Dividers</Text>
                  <div className="space-y-6">
                    <Divider />
                    <Divider label="OR" />
                    <div className="h-20 flex items-center">
                      <div>Left</div>
                      <Divider orientation="vertical" className="mx-4 h-full" />
                      <div>Right</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Text variant="h4" className="mb-4">Cards</Text>
                  <Card 
                    title="Card Title" 
                    subtitle="Card subtitle"
                    className="mb-4"
                  >
                    <Text variant="body-sm" color="muted">
                      This is a simple card with a title and subtitle.
                    </Text>
                  </Card>
                  
                  <Card hoverable className="mb-4">
                    <CardHeader title="Hoverable Card" action={<IconButton icon={<Settings />} variant="ghost" label="Settings" />} />
                    <CardBody>
                      <Text variant="body-sm" color="muted">
                        This card has hover effects and a custom action button.
                      </Text>
                    </CardBody>
                    <CardFooter>
                      <Flex justify="end">
                        <Button size="sm">Action</Button>
                      </Flex>
                    </CardFooter>
                  </Card>
                </div>
              </Grid>
            </CardBody>
          </Card>
        </section>
      )}
      
      {activeTab === 3 && (
        <section>
          <Heading level={2} className="mb-6">Layout System</Heading>
          
          <Card className="mb-8">
            <CardHeader title="Container" />
            <CardBody>
              <Text variant="body" className="mb-4">
                The Container component centers content horizontally with consistent padding and max-width constraints.
              </Text>
              
              <div className="space-y-4">
                <div className="border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
                  <Container maxWidth="sm" className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                    <Text align="center">Small Container (640px)</Text>
                  </Container>
                </div>
                
                <div className="border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
                  <Container maxWidth="md" className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                    <Text align="center">Medium Container (768px)</Text>
                  </Container>
                </div>
                
                <div className="border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
                  <Container maxWidth="lg" className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                    <Text align="center">Large Container (1024px)</Text>
                  </Container>
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Grid cols={{ sm: 1, lg: 2 }} gap={8}>
            <Card>
              <CardHeader title="Grid Layout" />
              <CardBody>
                <Text variant="body" className="mb-4">
                  The Grid component creates responsive grid layouts with customizable columns and gaps.
                </Text>
                
                <div className="space-y-6">
                  <div>
                    <Text variant="body-sm" weight="medium" className="mb-2">2 Columns</Text>
                    <Grid cols={2} gap={4}>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                        <Text align="center">Column 1</Text>
                      </div>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                        <Text align="center">Column 2</Text>
                      </div>
                    </Grid>
                  </div>
                  
                  <div>
                    <Text variant="body-sm" weight="medium" className="mb-2">3 Columns</Text>
                    <Grid cols={3} gap={4}>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                        <Text align="center">Column 1</Text>
                      </div>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                        <Text align="center">Column 2</Text>
                      </div>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                        <Text align="center">Column 3</Text>
                      </div>
                    </Grid>
                  </div>
                  
                  <div>
                    <Text variant="body-sm" weight="medium" className="mb-2">Responsive Columns</Text>
                    <Grid cols={{ sm: 1, md: 2, lg: 4 }} gap={4}>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                        <Text align="center">Column 1</Text>
                      </div>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                        <Text align="center">Column 2</Text>
                      </div>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                        <Text align="center">Column 3</Text>
                      </div>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                        <Text align="center">Column 4</Text>
                      </div>
                    </Grid>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader title="Flex Layout" />
              <CardBody>
                <Text variant="body" className="mb-4">
                  The Flex component creates flexible layouts with various alignment options.
                </Text>
                
                <div className="space-y-6">
                  <div>
                    <Text variant="body-sm" weight="medium" className="mb-2">Row with Space Between</Text>
                    <Flex justify="between" className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded">
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                        <Text variant="body-sm">Item 1</Text>
                      </div>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                        <Text variant="body-sm">Item 2</Text>
                      </div>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                        <Text variant="body-sm">Item 3</Text>
                      </div>
                    </Flex>
                  </div>
                  
                  <div>
                    <Text variant="body-sm" weight="medium" className="mb-2">Column with Center Alignment</Text>
                    <Flex direction="col" items="center" className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded h-40">
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                        <Text variant="body-sm">Item 1</Text>
                      </div>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                        <Text variant="body-sm">Item 2</Text>
                      </div>
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                        <Text variant="body-sm">Item 3</Text>
                      </div>
                    </Flex>
                  </div>
                  
                  <div>
                    <Text variant="body-sm" weight="medium" className="mb-2">Wrap with Gap</Text>
                    <Flex wrap="wrap" gap={2} className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                          <Text variant="body-sm">Item {i + 1}</Text>
                        </div>
                      ))}
                    </Flex>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Grid>
          
          <Card className="mt-8">
            <CardHeader title="Spacing System" />
            <CardBody>
              <Text variant="body" className="mb-4">
                The design system uses an 8px spacing scale for consistency.
              </Text>
              
              <div className="space-y-6">
                <div>
                  <Text variant="body-sm" weight="medium" className="mb-2">Spacing Scale</Text>
                  <div className="flex flex-wrap items-end gap-4">
                    {[1, 2, 3, 4, 6, 8, 12, 16].map(space => (
                      <div key={space} className="text-center">
                        <div 
                          className="bg-primary-400 dark:bg-primary-600 mb-2"
                          style={{ width: `${space * 0.25}rem`, height: `${space * 0.25}rem` }}
                        ></div>
                        <Text variant="caption">{space * 4}px</Text>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Text variant="body-sm" weight="medium" className="mb-2">Margin Example</Text>
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-2 mb-2 rounded">
                      <Text variant="body-sm">mb-2 (8px)</Text>
                    </div>
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-2 mb-4 rounded">
                      <Text variant="body-sm">mb-4 (16px)</Text>
                    </div>
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-2 mb-8 rounded">
                      <Text variant="body-sm">mb-8 (32px)</Text>
                    </div>
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                      <Text variant="body-sm">No margin</Text>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Text variant="body-sm" weight="medium" className="mb-2">Padding Example</Text>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                      <Text variant="body-sm">p-2 (8px)</Text>
                    </div>
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded">
                      <Text variant="body-sm">p-4 (16px)</Text>
                    </div>
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-6 rounded">
                      <Text variant="body-sm">p-6 (24px)</Text>
                    </div>
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-8 rounded">
                      <Text variant="body-sm">p-8 (32px)</Text>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>
      )}
    </Container>
  );
};