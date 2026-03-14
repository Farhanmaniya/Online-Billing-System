import api, { BASE_URL } from '../services/api';
import Navbar from '../components/Navbar';
import styles from './Settings.module.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    companyName: '',
    businessAddress: '',
    phoneNumber: '',
    taxId: ''
  });
  
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const { companyName, businessAddress, phoneNumber, taxId, companyLogo } = response.data;
      
      setFormData({
        companyName: companyName || '',
        businessAddress: businessAddress || '',
        phoneNumber: phoneNumber || '',
        taxId: taxId || ''
      });

      if (companyLogo) {
        setLogoPreview(`${BASE_URL}${companyLogo}`);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 2MB.' });
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setMessage({ type: 'error', text: 'Only JPG and PNG images are allowed.' });
        return;
      }
      
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      data.append('companyName', formData.companyName);
      data.append('businessAddress', formData.businessAddress);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('taxId', formData.taxId);
      
      if (logo) {
        data.append('companyLogo', logo);
      }

      await api.put('/users/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Business profile updated successfully!' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading settings...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>Business Settings</h1>

        {message.text && (
          <div className={message.type === 'error' ? styles.error : styles.success}>
            {message.text}
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'business' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('business')}
            >
              Business Info
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'logo' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('logo')}
            >
              Logo & Branding
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'tax' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('tax')}
            >
              Tax & Legal
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.formContent}>
            {activeTab === 'business' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    className={styles.input}
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Business Address *</label>
                  <textarea
                    name="businessAddress"
                    className={styles.textarea}
                    value={formData.businessAddress}
                    onChange={handleChange}
                    required
                    placeholder="Full street address, city, state, zip"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className={styles.input}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </>
            )}

            {activeTab === 'logo' && (
              <div className={styles.logoUpload}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Company Logo" className={styles.logoPreview} />
                ) : (
                  <div className={styles.logoPreview} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                    No Logo
                  </div>
                )}
                
                <label className={styles.uploadBtn}>
                  Choose Image
                  <input
                    type="file"
                    className={styles.fileInput}
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                  />
                </label>
                <p className={styles.helperText}>Recommended size: 300x300px. Max 2MB. PNG or JPG.</p>
              </div>
            )}

            {activeTab === 'tax' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tax Identification Number (VAT/GST/EIN) *</label>
                  <input
                    type="text"
                    name="taxId"
                    className={styles.input}
                    value={formData.taxId}
                    onChange={handleChange}
                    required
                    placeholder="e.g. US-123456789"
                  />
                  <p className={styles.helperText}>This will appear on all your invoices.</p>
                </div>
              </>
            )}

            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Saving Changes...' : 'Save Business Profile'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Settings;
