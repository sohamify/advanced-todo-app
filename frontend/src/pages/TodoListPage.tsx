import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, DragHandle } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { todoAPI } from '../services/api';
import type { Todo } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in-progress', 'completed']),
  deadline: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type TodoFormData = z.infer<typeof todoSchema>;

function SortableTodoCard({
  todo,
  onEdit,
  onDelete,
}: {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColor = {
    low: 'success',
    medium: 'warning',
    high: 'error',
  }[todo.priority] as 'success' | 'warning' | 'error';

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Drag Handle - safe element for dnd-kit props */}
      <Box {...attributes} {...listeners} sx={{ cursor: 'grab', pt: 0.5 }}>
        <DragHandle />
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6">{todo.title}</Typography>
        {todo.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {todo.description}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip label={todo.priority} color={priorityColor} size="small" />
          <Chip label={todo.status} size="small" />
          {todo.deadline && (
            <Chip label={`Due: ${dayjs(todo.deadline).format('MMM D, YYYY')}`} size="small" />
          )}
        </Stack>
        {todo.tags && todo.tags.length > 0 && todo.tags.map((tag) => (
          <Chip key={tag} label={tag} variant="outlined" size="small" sx={{ mt: 1, mr: 0.5 }} />
        ))}
      </Box>

      {/* Actions */}
      <Box>
        <IconButton size="small" onClick={() => onEdit(todo)}>
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(todo.id)}>
          <DeleteIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default function TodoListPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filters, setFilters] = useState({ priority: '', status: '', search: '' });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      deadline: '',
      tags: [],
    },
  });

  const loadTodos = async () => {
    try {
      const res = await todoAPI.getTodos(filters);
      setTodos(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Error loading todos:', err);
      if (err?.response?.status === 401) {
        navigate('/login');
      } else {
        setTodos([]);
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, filters]);

  const onSubmit = async (data: TodoFormData) => {
    try {
      if (editingTodo) {
        const res = await todoAPI.updateTodo(editingTodo.id, data);
        setTodos((prev) => prev.map((t) => (t.id === editingTodo.id ? res.data : t)));
      } else {
        const res = await todoAPI.createTodo(data as Omit<Todo, 'id' | 'userId'>);
        setTodos((prev) => [...prev, res.data]);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving todo:', err);
      alert('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this todo?')) return;
    try {
      await todoAPI.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      alert('Delete failed');
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setValue('title', todo.title);
    setValue('description', todo.description || '');
    setValue('priority', todo.priority);
    setValue('status', todo.status);
    setValue('deadline', todo.deadline || '');
    setValue('tags', todo.tags || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTodo(null);
    reset({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      deadline: '',
      tags: [],
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Safe render - ensure todos is always an array
  const todoIds = Array.isArray(todos) ? todos.map((t) => t.id) : [];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">My Todos</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Add Todo
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Todo List with Drag & Drop */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={todoIds} strategy={verticalListSortingStrategy}>
            {todos.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No todos yet. Create one!
              </Typography>
            ) : (
              todos.map((todo) => (
                <SortableTodoCard key={todo.id} todo={todo} onEdit={handleEdit} onDelete={handleDelete} />
              ))
            )}
          </SortableContext>
        </DndContext>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingTodo ? 'Edit' : 'Create New'} Todo</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Title"
                        error={!!errors.title}
                        helperText={errors.title?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} fullWidth label="Description" multiline rows={3} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select {...field} label="Priority">
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select {...field} label="Status">
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in-progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="deadline"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Deadline"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        label="Tags (comma separated)"
                        value={field.value?.join(', ') || ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean)
                          )
                        }
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} variant="contained">
              {editingTodo ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}