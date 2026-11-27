import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE, USE_BACKEND } from '../config';

interface SubscriptionForm {
  subscriptionName: string;
  subscriptionExpires: string;
  subscriptionPrice: string;
  chargedCard: string;
}

interface Subscription {
  id: number;
  userId: number;
  linkedDate: string;
  subscriptionName: string;
  subscriptionExpires: string;
  subscriptionPrice: number | null;
  chargedCard: string | null;
}

type ExpirationOption = 'month' | 'year' | 'custom' | null;

interface CalendarProps {
  username: string | null;
}

const CustomCalendar: React.FC<CalendarProps> = ({ username }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionForm>({
    subscriptionName: '',
    subscriptionExpires: '',
    subscriptionPrice: '',
    chargedCard: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  const getUsernameFromToken = (): string | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.sub || null;
    } catch {
      return null;
    }
  };

  // Fetch subscriptions on mount and when login status changes
  const fetchSubscriptions = async () => {
    if (!USE_BACKEND) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setSubscriptions([]);
      return;
    }

    setSubscriptionsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/subscription-days`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Fetched subscriptions:', data);
        // API returns single subscription or null, but we'll handle array too
        if (Array.isArray(data)) {
          setSubscriptions(data);
        } else if (data) {
          setSubscriptions([data]);
        } else {
          setSubscriptions([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [username]);

  // Normalize date string to YYYY-MM-DD format
  const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // Handle ISO format (2024-01-15T00:00:00.000Z) or simple date (2024-01-15)
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  // Get subscriptions that expire on a specific date
  const getSubscriptionsForDate = (date: Date): Subscription[] => {
    const dateStr = date.toISOString().split('T')[0];
    return subscriptions.filter(sub => {
      const subExpires = normalizeDate(sub.subscriptionExpires);
      return subExpires === dateStr;
    });
  };

  const handleAddSubscriptionClick = () => {
    if (!isLoggedIn()) {
      setShowLoginWarning(true);
      return;
    }
    setEditingSubscription(null);
    setShowSubscriptionForm(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setSubscriptionForm({
      subscriptionName: subscription.subscriptionName,
      subscriptionExpires: normalizeDate(subscription.subscriptionExpires),
      subscriptionPrice: subscription.subscriptionPrice?.toString() || '',
      chargedCard: subscription.chargedCard || '',
    });
    setExpirationOption('custom');
    setShowSubscriptionForm(true);
  };

  const handleDeleteSubscription = async (subscriptionId: number) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setFormError('You must be logged in to delete subscriptions');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/subscription-days/delete/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        setFormError(errorText || 'Failed to delete subscription');
        return;
      }

      // Refresh subscriptions list
      fetchSubscriptions();
    } catch (err: any) {
      setFormError(err.message || 'Network error');
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    // Reset form when clicking on a different day
    setShowSubscriptionForm(false);
    setEditingSubscription(null);
    setExpirationOption(null);
    setSubscriptionForm({
      subscriptionName: '',
      subscriptionExpires: '',
      subscriptionPrice: '',
      chargedCard: '',
    });
    setFormError(null);
    setFormSuccess(false);
    setShowLoginWarning(false);
  };

  const closeDetails = () => {
    setSelectedDate(null);
    setShowSubscriptionForm(false);
    setExpirationOption(null);
    setShowLoginWarning(false);
    setEditingSubscription(null);
    setSubscriptionForm({
      subscriptionName: '',
      subscriptionExpires: '',
      subscriptionPrice: '',
      chargedCard: '',
    });
    setFormError(null);
    setFormSuccess(false);
  };

  const handleFormChange = (field: keyof SubscriptionForm, value: string) => {
    setSubscriptionForm(prev => ({ ...prev, [field]: value }));
    setFormError(null);
    setFormSuccess(false);
  };

  const handleExpirationOptionChange = (option: ExpirationOption) => {
    setExpirationOption(option);
    if (option === 'month' || option === 'year') {
      // Start from selected date, not today
      const baseDate = selectedDate ? new Date(selectedDate) : new Date();
      if (option === 'month') {
        baseDate.setMonth(baseDate.getMonth() + 1);
      } else {
        baseDate.setFullYear(baseDate.getFullYear() + 1);
      }
      setSubscriptionForm(prev => ({
        ...prev,
        subscriptionExpires: baseDate.toISOString().split('T')[0],
      }));
    } else if (option === 'custom') {
      setSubscriptionForm(prev => ({
        ...prev,
        subscriptionExpires: '',
      }));
    }
  };

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    // Validate required fields
    if (!subscriptionForm.subscriptionName.trim()) {
      setFormError('Subscription name is required');
      return;
    }
    if (!subscriptionForm.subscriptionExpires) {
      setFormError('Expiration date is required');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setFormError('You must be logged in to add subscriptions');
      return;
    }

    setFormLoading(true);
    try {
      const username = getUsernameFromToken();

      // Use different endpoint for editing vs adding
      const isEditing = editingSubscription !== null;
      const endpoint = isEditing
        ? `${API_BASE}/subscription-days/update`
        : `${API_BASE}/subscription-days`;

      const bodyData = {
        username: username,
        linkedDate: selectedDate?.toISOString().split('T')[0],
        subscriptionName: subscriptionForm.subscriptionName,
        subscriptionExpires: subscriptionForm.subscriptionExpires,
        subscriptionPrice: subscriptionForm.subscriptionPrice ? parseFloat(subscriptionForm.subscriptionPrice) : null,
        chargedCard: subscriptionForm.chargedCard || null,
        ...(isEditing && { id: editingSubscription.id }),
      };

      const res = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        setFormError(errorText || (isEditing ? 'Failed to update subscription' : 'Failed to add subscription'));
        return;
      }

      setFormSuccess(true);
      setExpirationOption(null);
      setEditingSubscription(null);
      setSubscriptionForm({
        subscriptionName: '',
        subscriptionExpires: '',
        subscriptionPrice: '',
        chargedCard: '',
      });
      setShowSubscriptionForm(false);
      // Refresh subscriptions list
      fetchSubscriptions();
    } catch (err: any) {
      setFormError(err.message || 'Network error');
    } finally {
      setFormLoading(false);
    }
  };

  const calculateDaysDifference = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const timeDiff = targetDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getWeekday = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getCountdownText = (days: number) => {
    if (days === 0) return { text: 'Today', class: 'day-details-countdown--today' };
    if (days === 1) return { text: 'Tomorrow', class: '' };
    if (days === -1) return { text: 'Yesterday', class: 'day-details-countdown--past' };
    if (days > 0) return { text: `In ${days} days`, class: '' };
    return { text: `${Math.abs(days)} days ago`, class: 'day-details-countdown--past' };
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setActiveStartDate(today);
    setShowSubscriptionForm(false);
    setEditingSubscription(null);
    setExpirationOption(null);
    setSubscriptionForm({
      subscriptionName: '',
      subscriptionExpires: '',
      subscriptionPrice: '',
      chargedCard: '',
    });
    setFormError(null);
    setFormSuccess(false);
    setShowLoginWarning(false);
  };

  const daysDiff = selectedDate ? calculateDaysDifference(selectedDate) : 0;
  const countdown = selectedDate ? getCountdownText(daysDiff) : null;

  return (
    <motion.div
      className="calendar-wrapper"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className="calendar-container"
        layout
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <Calendar
          onClickDay={handleDayClick}
          value={selectedDate}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setActiveStartDate(activeStartDate)}
          tileContent={({ date }) => {
            const subs = getSubscriptionsForDate(date);
            if (subs.length > 0) {
              return (
                <div className="calendar-day-indicator">
                  <span className="calendar-day-dot"></span>
                </div>
              );
            }
            return null;
          }}
        />
        <motion.button
          className="today-btn"
          onClick={goToToday}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Go to Current Date
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            className="day-details-panel"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="day-details-header">
              <h3 className="day-details-title">Day Details</h3>
              <motion.button
                className="day-details-close"
                onClick={closeDetails}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="day-details-date">{formatDate(selectedDate)}</div>
              <div className="day-details-weekday">{getWeekday(selectedDate)}</div>
            </motion.div>

            <motion.div
              className={`day-details-countdown ${countdown?.class}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {countdown?.text}
            </motion.div>

            <motion.div
              className="day-details-events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {formSuccess && (
                <div className="subscription-success">Subscription added successfully!</div>
              )}
              {subscriptionsLoading ? (
                <div className="events-loading">Loading...</div>
              ) : getSubscriptionsForDate(selectedDate).length > 0 ? (
                <div className="subscriptions-list">
                  {getSubscriptionsForDate(selectedDate).map(sub => (
                    <div key={sub.id} className="subscription-item">
                      <div className="subscription-item-header">
                        <span className="subscription-item-name">{sub.subscriptionName}</span>
                        <div className="subscription-item-actions">
                          {sub.subscriptionPrice && (
                            <span className="subscription-item-price">${sub.subscriptionPrice.toFixed(2)}</span>
                          )}
                          <button
                            className="subscription-edit-btn"
                            onClick={() => handleEditSubscription(sub)}
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            className="subscription-delete-btn"
                            onClick={() => handleDeleteSubscription(sub.id)}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="subscription-item-details">
                        <span className="subscription-item-expires">
                          Expires: {new Date(sub.subscriptionExpires).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        {sub.chargedCard && (
                          <span className="subscription-item-card">{sub.chargedCard}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-events">No subscriptions for this day</div>
              )}
            </motion.div>

            <motion.div
              className="day-details-subscription"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <AnimatePresence>
                {showLoginWarning && (
                  <motion.div
                    className="login-warning"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="login-warning-icon">⚠</div>
                    <div className="login-warning-text">
                      <strong>Login Required</strong>
                      <p>Please log in to add subscriptions</p>
                    </div>
                    <button
                      className="login-warning-close"
                      onClick={() => setShowLoginWarning(false)}
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {USE_BACKEND && (!showSubscriptionForm ? (
                <motion.button
                  className="subscription-add-btn"
                  onClick={handleAddSubscriptionClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  + Add Subscription
                </motion.button>
              ) : (
                <motion.form
                  className="subscription-form"
                  onSubmit={handleAddSubscription}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="subscription-form-header">
                    <h4>{editingSubscription ? 'Edit Subscription' : 'New Subscription'}</h4>
                    <button
                      type="button"
                      className="subscription-form-close"
                      onClick={() => {
                        setShowSubscriptionForm(false);
                        setEditingSubscription(null);
                        setSubscriptionForm({
                          subscriptionName: '',
                          subscriptionExpires: '',
                          subscriptionPrice: '',
                          chargedCard: '',
                        });
                        setExpirationOption(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <label className="subscription-label">
                    <span>Subscription Name *</span>
                    <input
                      type="text"
                      value={subscriptionForm.subscriptionName}
                      onChange={e => handleFormChange('subscriptionName', e.target.value)}
                      placeholder="e.g. Netflix, Spotify"
                      required
                    />
                  </label>

                  <label className="subscription-label">
                    <span>Expiration Date *</span>
                    <div className="expiration-options">
                      <button
                        type="button"
                        className={`expiration-option-btn ${expirationOption === 'month' ? 'active' : ''}`}
                        onClick={() => handleExpirationOptionChange('month')}
                      >
                        1 Month
                      </button>
                      <button
                        type="button"
                        className={`expiration-option-btn ${expirationOption === 'year' ? 'active' : ''}`}
                        onClick={() => handleExpirationOptionChange('year')}
                      >
                        1 Year
                      </button>
                      <button
                        type="button"
                        className={`expiration-option-btn ${expirationOption === 'custom' ? 'active' : ''}`}
                        onClick={() => handleExpirationOptionChange('custom')}
                      >
                        Custom
                      </button>
                    </div>
                    <AnimatePresence>
                      {expirationOption === 'custom' && (
                        <motion.div
                          className="custom-date-picker"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <input
                            type="date"
                            value={subscriptionForm.subscriptionExpires}
                            onChange={e => handleFormChange('subscriptionExpires', e.target.value)}
                            required
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {expirationOption && expirationOption !== 'custom' && subscriptionForm.subscriptionExpires && (
                      <div className="expiration-preview">
                        Expires: {new Date(subscriptionForm.subscriptionExpires).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </label>

                  <label className="subscription-label">
                    <span>Price (optional)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={subscriptionForm.subscriptionPrice}
                      onChange={e => handleFormChange('subscriptionPrice', e.target.value)}
                      placeholder="0.00"
                    />
                  </label>

                  <label className="subscription-label">
                    <span>Charged Card (optional)</span>
                    <input
                      type="text"
                      value={subscriptionForm.chargedCard}
                      onChange={e => handleFormChange('chargedCard', e.target.value)}
                      placeholder="e.g. **** 1234"
                    />
                  </label>

                  {formError && <div className="subscription-error">{formError}</div>}

                  <div className="subscription-form-actions">
                    <button
                      type="button"
                      className="subscription-cancel-btn"
                      onClick={() => {
                        setShowSubscriptionForm(false);
                        setEditingSubscription(null);
                        setSubscriptionForm({
                          subscriptionName: '',
                          subscriptionExpires: '',
                          subscriptionPrice: '',
                          chargedCard: '',
                        });
                        setExpirationOption(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="subscription-submit-btn"
                      disabled={formLoading}
                    >
                      {formLoading ? 'Saving...' : (editingSubscription ? 'Save Changes' : 'Add Subscription')}
                    </button>
                  </div>
                </motion.form>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CustomCalendar;
