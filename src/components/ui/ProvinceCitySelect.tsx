"use client";

import { useState, useEffect } from "react";
import { getProvinceList, getCitiesByProvince, findProvince, findCity, CityInfo } from "@/lib/tapin-rates";

interface ProvinceCitySelectProps {
  initialProvince?: string;
  initialCity?: string;
  onLocationChange?: (location: {
    province: string;
    city: string;
    provinceId: number;
    cityId?: string;
  }) => void;
  provinceInputName?: string;
  cityInputName?: string;
  required?: boolean;
}

export function ProvinceCitySelect({
  initialProvince = "",
  initialCity = "",
  onLocationChange,
  provinceInputName = "province",
  cityInputName = "city",
  required = true,
}: ProvinceCitySelectProps) {
  const provinces = getProvinceList();

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | "">("");
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [cities, setCities] = useState<CityInfo[]>([]);

  // Initialize from initial values
  useEffect(() => {
    if (initialProvince) {
      const p = findProvince(initialProvince);
      if (p) {
        setSelectedProvinceId(p.id);
        const cityList = getCitiesByProvince(p.id);
        setCities(cityList);

        if (initialCity) {
          const c = findCity(p.id, initialCity);
          if (c) {
            setSelectedCityId(c.id);
            onLocationChange?.({
              province: p.title,
              city: c.title,
              provinceId: p.id,
              cityId: c.id,
            });
            return;
          }
        }

        onLocationChange?.({
          province: p.title,
          city: initialCity,
          provinceId: p.id,
        });
      }
    }
  }, [initialProvince, initialCity]);

  const handleProvinceChange = (pIdStr: string) => {
    const pId = Number(pIdStr);
    setSelectedProvinceId(pId);
    setSelectedCityId("");

    const matchedProv = provinces.find((p) => p.id === pId);
    const cityList = pId ? getCitiesByProvince(pId) : [];
    setCities(cityList);

    const firstCity = cityList.length > 0 ? cityList[0] : undefined;
    if (firstCity) {
      setSelectedCityId(firstCity.id);
    }

    if (matchedProv) {
      onLocationChange?.({
        province: matchedProv.title,
        city: firstCity ? firstCity.title : "",
        provinceId: matchedProv.id,
        cityId: firstCity ? firstCity.id : undefined,
      });
    }
  };

  const handleCityChange = (cId: string) => {
    setSelectedCityId(cId);
    const matchedProv = provinces.find((p) => p.id === selectedProvinceId);
    const matchedCity = cities.find((c) => c.id === cId);

    if (matchedProv) {
      onLocationChange?.({
        province: matchedProv.title,
        city: matchedCity ? matchedCity.title : "",
        provinceId: matchedProv.id,
        cityId: matchedCity ? matchedCity.id : undefined,
      });
    }
  };

  const selectedProvinceTitle = provinces.find((p) => p.id === selectedProvinceId)?.title || "";
  const selectedCityTitle = cities.find((c) => c.id === selectedCityId)?.title || "";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Hidden inputs to feed formData correctly */}
      <input type="hidden" name={provinceInputName} value={selectedProvinceTitle} />
      <input type="hidden" name={cityInputName} value={selectedCityTitle} />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          استان {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedProvinceId}
          onChange={(e) => handleProvinceChange(e.target.value)}
          required={required}
          className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
        >
          <option value="" disabled>
            انتخاب استان...
          </option>
          {provinces.map((prov) => (
            <option key={prov.id} value={prov.id} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">
              {prov.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          شهر {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedCityId}
          onChange={(e) => handleCityChange(e.target.value)}
          disabled={!selectedProvinceId}
          required={required}
          className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer disabled:opacity-50"
        >
          <option value="" disabled>
            {selectedProvinceId ? "انتخاب شهر..." : "ابتدا استان را انتخاب کنید"}
          </option>
          {cities.map((city) => (
            <option key={city.id} value={city.id} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">
              {city.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
