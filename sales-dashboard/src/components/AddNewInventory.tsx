import { useCreateInventory } from '@/hooks/useInventoryMutations';
import { format } from 'date-fns';
import { Button } from './ui/button';

type Props = {
  currentDate: Date;
}

export const AddNewInventory = ({ currentDate }: Props) => {
  const { mutate: createInventory, isPending } = useCreateInventory();

  const createNewEntry = () => {
    createInventory({
      date: format(currentDate, 'yyyy-MM-dd'),
      items: [],
    });
  };
  return (
    <Button className='mt-4' disabled={isPending} onClick={() => createNewEntry()}>
      Create New Entry
    </Button>
  )
}
