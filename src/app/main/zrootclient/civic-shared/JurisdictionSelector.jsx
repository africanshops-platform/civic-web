import { useState, useEffect, memo } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Chip, Box, Typography, CircularProgress } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { motion } from 'framer-motion';
import useSellerCountries from 'app/configs/data/server-calls/countries/useCountries';
import { getStateByCountryId, getLgasByStateId } from 'app/configs/data/client/RepositoryClient';

const SELECT_SX = {
  borderRadius: '12px',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fdba74' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ea580c' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ea580c' },
};

function JurisdictionSelector({ onChange, compact = false, defaultValues = {} }) {
  const [selectedCountry, setSelectedCountry] = useState(defaultValues.country || '');
  const [selectedState, setSelectedState] = useState(defaultValues.state || '');
  const [selectedLga, setSelectedLga] = useState(defaultValues.lga || '');
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);

  const { data: countriesData, isLoading: loadingCountries } = useSellerCountries();
  const countries = countriesData?.data?.payload || countriesData?.data || [];

  useEffect(() => {
    if (!selectedCountry) { setStates([]); setSelectedState(''); setLgas([]); setSelectedLga(''); return; }
    setLoadingStates(true);
    getStateByCountryId(selectedCountry)
      .then((res) => setStates(res?.data?.payload || res?.data || []))
      .catch(() => setStates([]))
      .finally(() => setLoadingStates(false));
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedState) { setLgas([]); setSelectedLga(''); return; }
    setLoadingLgas(true);
    getLgasByStateId(selectedState)
      .then((res) => setLgas(res?.data?.payload || res?.data || []))
      .catch(() => setLgas([]))
      .finally(() => setLoadingLgas(false));
  }, [selectedState]);

  useEffect(() => {
    onChange?.({ countryId: selectedCountry, stateId: selectedState, lgaId: selectedLga });
  }, [selectedCountry, selectedState, selectedLga]);

  const selectedCountryName = countries?.find?.((c) => c._id === selectedCountry || c.id === selectedCountry)?.name;
  const selectedStateName = states?.find?.((s) => s._id === selectedState || s.id === selectedState)?.name;
  const selectedLgaName = lgas?.find?.((l) => l._id === selectedLga || l.id === selectedLga)?.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {!compact && (
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
          >
            <LocationOn sx={{ color: 'white', fontSize: '1rem' }} />
          </div>
          <Typography sx={{ fontWeight: 700, color: '#1f2937', fontSize: '0.95rem' }}>
            Filter by Jurisdiction
          </Typography>
        </div>
      )}

      {/* Active jurisdiction pills */}
      {(selectedCountryName || selectedStateName || selectedLgaName) && (
        <Box className="flex flex-wrap gap-2 mb-4">
          {selectedCountryName && (
            <Chip
              label={selectedCountryName}
              size="small"
              onDelete={() => { setSelectedCountry(''); }}
              sx={{ backgroundColor: '#fff7ed', color: '#ea580c', borderColor: '#fdba74', border: '1px solid', fontWeight: 600 }}
            />
          )}
          {selectedStateName && (
            <Chip
              label={selectedStateName}
              size="small"
              onDelete={() => { setSelectedState(''); }}
              sx={{ backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#fb923c', border: '1px solid', fontWeight: 600 }}
            />
          )}
          {selectedLgaName && (
            <Chip
              label={selectedLgaName}
              size="small"
              onDelete={() => setSelectedLga('')}
              sx={{ backgroundColor: '#ffedd5', color: '#9a3412', borderColor: '#f97316', border: '1px solid', fontWeight: 600 }}
            />
          )}
        </Box>
      )}

      <div className="flex flex-col gap-3">
        <FormControl fullWidth size="small">
          <InputLabel sx={{ color: '#ea580c', '&.Mui-focused': { color: '#ea580c' } }}>Country</InputLabel>
          <Select value={selectedCountry} label="Country" onChange={(e) => setSelectedCountry(e.target.value)} sx={SELECT_SX}
            endAdornment={loadingCountries ? <CircularProgress size={16} sx={{ color: '#ea580c', mr: 2 }} /> : null}>
            <MenuItem value=""><em>All Countries</em></MenuItem>
            {(Array.isArray(countries) ? countries : []).map((c) => (
              <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" disabled={!selectedCountry || loadingStates}>
          <InputLabel sx={{ color: '#ea580c', '&.Mui-focused': { color: '#ea580c' } }}>State</InputLabel>
          <Select value={selectedState} label="State" onChange={(e) => setSelectedState(e.target.value)} sx={SELECT_SX}
            endAdornment={loadingStates ? <CircularProgress size={16} sx={{ color: '#ea580c', mr: 2 }} /> : null}>
            <MenuItem value=""><em>All States</em></MenuItem>
            {states.map((s) => (
              <MenuItem key={s._id || s.id} value={s._id || s.id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" disabled={!selectedState || loadingLgas}>
          <InputLabel sx={{ color: '#ea580c', '&.Mui-focused': { color: '#ea580c' } }}>LGA</InputLabel>
          <Select value={selectedLga} label="LGA" onChange={(e) => setSelectedLga(e.target.value)} sx={SELECT_SX}
            endAdornment={loadingLgas ? <CircularProgress size={16} sx={{ color: '#ea580c', mr: 2 }} /> : null}>
            <MenuItem value=""><em>All LGAs</em></MenuItem>
            {lgas.map((l) => (
              <MenuItem key={l._id || l.id} value={l._id || l.id}>{l.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </motion.div>
  );
}

export default memo(JurisdictionSelector);
