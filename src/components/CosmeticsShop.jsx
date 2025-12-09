import React, { useState, useEffect } from 'react';
import { COSMETICS, getCosmeticById, getRarityInfo } from '../data/cosmetics';
import '../styles/CosmeticsShop.css';

export default function CosmeticsShop() {
  const [activeTab, setActiveTab] = useState('themes');
  const [userGems, setUserGems] = useState(0);
  const [ownedCosmetics, setOwnedCosmetics] = useState([]);
  const [equippedCosmetics, setEquippedCosmetics] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [purchasing, setPurchasing] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const headers = token ? { 'x-user-token': token } : {};
      
      const [gemsRes, inventoryRes, equippedRes] = await Promise.all([
        fetch(`${API_URL}/api/user/gems`, { headers }),
        fetch(`${API_URL}/api/user/cosmetics/inventory`, { headers }),
        fetch(`${API_URL}/api/user/cosmetics/equipped`, { headers })
      ]);

      if (gemsRes.ok) {
        const data = await gemsRes.json();
        setUserGems(data.gems);
      }
      if (inventoryRes.ok) {
        const data = await inventoryRes.json();
        setOwnedCosmetics(data.inventory || []);
      }
      if (equippedRes.ok) {
        const data = await equippedRes.json();
        setEquippedCosmetics(data.equipped || {});
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (cosmetic) => {
    if (userGems < cosmetic.cost) {
      setMessage(`❌ Not enough gems! Need ${cosmetic.cost}, have ${userGems}`);
      return;
    }

    try {
      setPurchasing(cosmetic.id);
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/api/user/cosmetics/purchase`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-token': token
        },
        body: JSON.stringify({ cosmeticId: cosmetic.id })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Purchased ${cosmetic.name}!`);
        setUserGems(data.newBalance);
        setOwnedCosmetics([...ownedCosmetics, cosmetic.id]);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Error purchasing cosmetic:', error);
      setMessage('❌ Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquip = async (type, cosmetic) => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/api/user/cosmetics/equip`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-token': token
        },
        body: JSON.stringify({ type, cosmeticId: cosmetic.id })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Equipped ${cosmetic.name}!`);
        setEquippedCosmetics(data.equipped);
        // Refresh data to ensure UI is in sync
        fetchUserData();
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Error equipping cosmetic:', error);
      setMessage('❌ Equip failed');
    }
  };

  const handleUnequip = async (type) => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/api/user/cosmetics/equip`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-token': token
        },
        body: JSON.stringify({ type, cosmeticId: null })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Unequipped!`);
        setEquippedCosmetics(data.equipped);
        // Refresh data to ensure UI is in sync
        fetchUserData();
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Error unequipping cosmetic:', error);
      setMessage('❌ Unequip failed');
    }
  };

  const getTabCosmetics = () => {
    const tabMap = {
      themes: COSMETICS.themes,
      titles: COSMETICS.titles,
      colors: COSMETICS.nameColors
    };
    return tabMap[activeTab] || [];
  };

  const getEquipType = () => {
    const typeMap = {
      themes: 'theme',
      titles: 'title',
      colors: 'nameColor'
    };
    return typeMap[activeTab];
  };

  const renderCosmeticCard = (cosmetic) => {
    const isOwned = cosmetic.rarity === 'default' || ownedCosmetics.includes(cosmetic.id);
    const equipped =
      activeTab === 'themes' ? equippedCosmetics.equipped_theme === cosmetic.id :
      activeTab === 'titles' ? equippedCosmetics.equipped_title === cosmetic.id :
      equippedCosmetics.equipped_name_color === cosmetic.id;
    
    const rarityInfo = getRarityInfo(cosmetic.rarity);

    return (
      <div
        key={cosmetic.id}
        className={`cosmetic-card rarity-${cosmetic.rarity} ${equipped ? 'equipped' : ''}`}
        style={activeTab === 'themes' ? { '--theme-color': cosmetic.colors?.keyword } : {}}
      >
        {/* Header */}
        <div className="cosmetic-header">
          <div className="cosmetic-name-rarity">
            <h3>{cosmetic.name}</h3>
            <span className="rarity-badge" style={{ color: rarityInfo.color }}>
              {rarityInfo.emoji} {rarityInfo.label}
            </span>
          </div>
          {equipped && <div className="equipped-badge">✓ EQUIPPED</div>}
        </div>

        {/* Description */}
        <p className="cosmetic-description">{cosmetic.description}</p>

        {/* Preview */}
        <div className="cosmetic-preview">
          {activeTab === 'themes' && (
            <div className="theme-preview" style={{ backgroundColor: cosmetic.colors.bg }}>
              <div style={{ color: cosmetic.colors.keyword }}>const</div>
              <div style={{ color: cosmetic.colors.string }}>hello =</div>
              <div style={{ color: cosmetic.colors.string }}>"world"</div>
            </div>
          )}
          {activeTab === 'titles' && (
            <div className="title-preview">{cosmetic.display}</div>
          )}
          {activeTab === 'colors' && (
            <div
              className="color-preview"
              style={{
                color: cosmetic.color,
                textShadow: cosmetic.textShadow || (cosmetic.gradient ? 'none' : undefined),
                background: cosmetic.gradient ? cosmetic.gradient : undefined,
                backgroundClip: cosmetic.gradient ? 'text' : undefined,
                WebkitBackgroundClip: cosmetic.gradient ? 'text' : undefined,
                WebkitTextFillColor: cosmetic.gradient ? 'transparent' : 'inherit'
              }}
            >
              Your Username
            </div>
          )}
        </div>

        {/* Cost / Button */}
        <div className="cosmetic-footer">
          {cosmetic.rarity === 'default' ? (
            <span className="free-badge">✨ Default</span>
          ) : (
            <>
              <span className="gem-cost">
                💎 {cosmetic.cost}
              </span>
              {isOwned ? (
                equipped ? (
                  <div className="equip-buttons">
                    <button
                      className="equip-btn equipped"
                      disabled
                    >
                      ✓ Equipped
                    </button>
                    <button
                      className="unequip-btn"
                      onClick={() => handleUnequip(getEquipType())}
                    >
                      🗑️ Unequip
                    </button>
                  </div>
                ) : (
                  <button
                    className="equip-btn"
                    onClick={() => handleEquip(getEquipType(), cosmetic)}
                  >
                    Equip
                  </button>
                )
              ) : (
                <button
                  className="purchase-btn"
                  onClick={() => handlePurchase(cosmetic)}
                  disabled={purchasing === cosmetic.id || userGems < cosmetic.cost}
                >
                  {purchasing === cosmetic.id ? '...' : 'Buy'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="cosmetics-shop loading">Loading shop...</div>;
  }

  return (
    <div className="cosmetics-shop">
      <div className="shop-header">
        <div className="shop-title">
          <h1>✨ Cosmetics Shop</h1>
          <div className="gem-balance">
            💎 {userGems} Gems
          </div>
        </div>
        {message && <div className="message">{message}</div>}
      </div>

      {/* Currently Equipped Display */}
      <div className="equipped-display">
        <h2>👗 Currently Equipped</h2>
        <div className="equipped-items">
          <div className="equipped-item">
            <span className="item-label">🎨 Theme:</span>
            <span className="item-name">
              {equippedCosmetics.equipped_theme ? 
                getCosmeticById(equippedCosmetics.equipped_theme)?.name || 'Unknown' 
                : 'Default'}
            </span>
          </div>
          <div className="equipped-item">
            <span className="item-label">👑 Title:</span>
            <span className="item-name">
              {equippedCosmetics.equipped_title ? 
                getCosmeticById(equippedCosmetics.equipped_title)?.display || 'Unknown' 
                : 'None'}
            </span>
          </div>
          <div className="equipped-item">
            <span className="item-label">🎨 Name Color:</span>
            <span className="item-name">
              {equippedCosmetics.equipped_name_color ? 
                getCosmeticById(equippedCosmetics.equipped_name_color)?.name || 'Unknown' 
                : 'Default'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="shop-tabs">
        <button
          className={`tab ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => setActiveTab('themes')}
        >
          🎨 Editor Themes
        </button>
        <button
          className={`tab ${activeTab === 'titles' ? 'active' : ''}`}
          onClick={() => setActiveTab('titles')}
        >
          👑 Titles
        </button>
        <button
          className={`tab ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
        >
          🎨 Name Colors
        </button>
      </div>

      {/* Cosmetics Grid */}
      <div className="cosmetics-grid">
        {getTabCosmetics().map(cosmetic => renderCosmeticCard(cosmetic))}
      </div>
    </div>
  );
}
